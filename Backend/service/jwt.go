package auth

import (
    "errors"
    "os"
    "time"
    "github.com/golang-jwt/jwt/v5"
    "github.com/joho/godotenv"
)

func init() {
    if err := godotenv.Load(); err != nil {
        panic("Error al cargar el archivo .env")
    }
}

var jwtKey = []byte(getJWTSecret())

func getJWTSecret() string {
    if k := os.Getenv("JWT_SECRET"); k != "" {
        return k
    }
    return "tu_clave_secreta"
}

type Claims struct {
    UserID int    `json:"user_id"`
    Role   string `json:"role"`
    Email   string `json:"email"`
    jwt.RegisteredClaims
}

func GenerateToken(userID int, email string, role string) (string, error) {
	claims := Claims{
		UserID: userID,
		Email:  email,   // Guardamos el email en los claims
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)), // Token válido por 24 horas
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

func ValidateToken(tokenStr string) (*Claims, error) {
    claims := &Claims{}
    tok, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
        if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok || t.Method.Alg() != "HS256" {
            return nil, errors.New("algoritmo de firma inválido")
        }
        return []byte(getJWTSecret()), nil
    })

    if err != nil || !tok.Valid {
        return nil, errors.New("token inválido")
    }

    if claims.ExpiresAt == nil || claims.ExpiresAt.Time.Before(time.Now()) {
        return nil, errors.New("token expirado o claims inválidos")
    }

    return claims, nil
}
