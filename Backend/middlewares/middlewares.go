package middlewares

import (
	"net/http"
	"strings"
	"github.com/gin-gonic/gin"
	auth "github.com/VinkoRobi2/FlashWorkEC/service"

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

		// Validar el token
		claims, err := auth.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido o expirado", "details": err.Error()})
			c.Abort()
			return
		}

		// Asegúrate de que claims tenga el tipo correcto (Claim struct)
		if claims == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token no contiene claims válidas"})
			c.Abort()
			return
		}

		// Ahora, obtenemos el UserID de las claims correctamente
		userId := claims.UserID
		if userId == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "UserID no encontrado en las claims"})
			c.Abort()
			return
		}

		// Agregar userID y roles a la solicitud
		c.Set("userID", userId)

		roles := claims.Role
		if roles == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Roles no encontrados en las claims"})
			c.Abort()
			return
		}
		c.Set("roles", roles)

		// Continuar con la ejecución
		c.Next()
	}
}