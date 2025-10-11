package middlewares

import (
	"net/http"
	"strings"

	auth "github.com/VinkoRobi2/FlashWorkEC/service"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // ✅ Dejar pasar preflight CORS
        if c.Request.Method == http.MethodOptions {
            c.AbortWithStatus(http.StatusNoContent) // 204
            return
        }

        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "No autorizado: Falta Authorization header"})
            c.Abort()
            return
        }
        parts := strings.SplitN(authHeader, " ", 2)
        if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Formato del token inválido"})
            c.Abort()
            return
        }
        tokenString := parts[1]
        claims, err := auth.ValidateToken(tokenString)
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido o expirado", "details": err.Error()})
            c.Abort()
            return
        }
        c.Set("userID", claims.UserID)

        roles := claims.Role
        c.Set("roles", roles)

        c.Next()
    }
}