package verify

import (
    "database/sql"
    "errors"
    "log"
    "net/http"
    "os"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
)

// Claims del token de verificación de correo
type EmailVerificationClaims struct {
    Email string `json:"email"`
    jwt.RegisteredClaims
}

// clave secreta global
var jwtKey = []byte(getJWTSecret())

func getJWTSecret() string {
    if k := os.Getenv("JWT_SECRET"); k != "" {
        return k
    }
    // Ojo: cámbialo en producción
    return "supersecretkey"
}

// Generar token de verificación (por si no lo tienes así)
func GenerateEmailVerificationToken(email string, ttl time.Duration) (string, error) {
    now := time.Now()
    claims := &EmailVerificationClaims{
        Email: email,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
            IssuedAt:  jwt.NewNumericDate(now),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtKey)
}

// Validar token de verificación
func ValidateEmailVerificationToken(tokenStr string) (string, error) {
    claims := &EmailVerificationClaims{}

    token, err := jwt.ParseWithClaims(
        tokenStr,
        claims,
        func(t *jwt.Token) (interface{}, error) {
            // Aseguramos algoritmo HS256
            if t.Method.Alg() != jwt.SigningMethodHS256.Alg() {
                return nil, errors.New("algoritmo de firma inválido: " + t.Method.Alg())
            }
            return jwtKey, nil
        },
        jwt.WithLeeway(30*time.Second),
    )

    if err != nil {
        log.Printf("error parseando token de verificación: %v", err)

        // Diferenciamos expirado
        if errors.Is(err, jwt.ErrTokenExpired) {
            return "", errors.New("token expirado")
        }
        return "", errors.New("token inválido")
    }

    if !token.Valid {
        log.Println("token de verificación no válido (firma o claims)")
        return "", errors.New("token inválido")
    }

    if claims.Email == "" {
        return "", errors.New("token no contiene un email válido")
    }

    return claims.Email, nil
}

// Handler de verificación
func VerifyEmailHandler(c *gin.Context, db *sql.DB) {
    // 1) Sacar el token: primero query, luego param (para cubrir ambos casos)
    tokenStr := c.Query("token")
    if tokenStr == "" {
        tokenStr = c.Param("token")
    }

    if tokenStr == "" {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Token no proporcionado",
        })
        return
    }

    // 2) Validar token
    email, err := ValidateEmailVerificationToken(tokenStr)
    if err != nil {
        status := http.StatusUnauthorized
        if err.Error() == "token expirado" {
            status = http.StatusUnauthorized
        }
        c.JSON(status, gin.H{
            "message": "Token inválido o expirado",
            "err":     err.Error(),
        })
        return
    }

    // 3) Actualizar en estudiantes
    result, err := db.Exec(
        "UPDATE estudiantes SET email_verificado = TRUE WHERE email = $1",
        email,
    )
    if err != nil {
        log.Println("Error al verificar el email en estudiantes:", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Error al verificar el email en estudiantes",
        })
        return
    }

    rowsAffected, _ := result.RowsAffected()
    if rowsAffected == 0 {
        // 4) Si no existe como estudiante, intentamos en empleadores
        result, err = db.Exec(
            "UPDATE empleadores SET email_verificado = TRUE WHERE email = $1",
            email,
        )
        if err != nil {
            log.Println("Error al verificar el email en empleadores:", err)
            c.JSON(http.StatusInternalServerError, gin.H{
                "message": "Error al verificar el email en empleadores",
            })
            return
        }

        rowsAffected, _ = result.RowsAffected()
        if rowsAffected == 0 {
            c.JSON(http.StatusNotFound, gin.H{
                "message": "Correo electrónico no encontrado en ninguna tabla",
            })
            return
        }
    }

    // 5) OK
    c.JSON(http.StatusOK, gin.H{
        "message": "Correo electrónico verificado correctamente.",
    })
}