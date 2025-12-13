package auth

import (
	"errors"
	"os"
	"time"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"log"
)

func init() {
    if err := godotenv.Load(); err != nil {
        panic("Error al cargar el archivo .env")
    }
}

var jwtKey = "supersecretkey"

func getJWTSecret() string {
    if k := os.Getenv("JWT_SECRET"); k != "" {
        return k
    }
    return "supersecretkey"
}

type Claims struct {
    UserID int    `json:"user_id"`
    Role   string `json:"role"`
    Email  string `json:"email"`
    jwt.RegisteredClaims
}

// Función para generar el token
func GenerateToken(userID int, email string, role string) (string, error) {
	// Definir las claims del token
	claims := Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)), // Token válido por 24 horas
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	// Crear el token con las claims y el algoritmo HS256
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Firmar el token con la clave secreta y devolverlo
	tokenString, err := token.SignedString([]byte(getJWTSecret()))
	if err != nil {
		log.Println("Error al generar el token:", err)
		return "", err
	}

	return tokenString, nil
}

// Función para validar el token
func ValidateToken(tokenStr string) (*Claims, error) {
    claims := &Claims{}
    
    

    // Parsear el token con las claims
    tok, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {

        if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok || t.Method.Alg() != "HS256" {
            log.Println("Error: Algoritmo de firma inválido")
            return nil, errors.New("algoritmo de firma inválido")
        }
        return []byte(getJWTSecret()), nil
    })

    // Si hubo un error al parsear el token
    if err != nil {

        return nil, errors.New("token inválido")
    }

    // Verificar si el token es válido
    if !tok.Valid {

        return nil, errors.New("token inválido")
    }

    // Verificar si el token ha expirado

    if claims.ExpiresAt == nil || claims.ExpiresAt.Time.Before(time.Now()) {

        return nil, errors.New("token expirado o claims inválidos")
    }

    
    return claims, nil
}