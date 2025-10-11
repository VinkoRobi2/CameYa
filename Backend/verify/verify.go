package verify

import (
	"database/sql"
	"log"
	"net/http"

	auth "github.com/VinkoRobi2/FlashWorkEC/service"
	"github.com/gin-gonic/gin"
)

// Función para manejar la verificación del correo electrónico
func VerifyEmailHandler(c *gin.Context, db *sql.DB) {
	// Obtener el token de la URL
	tokenStr := c.DefaultQuery("token", "")
	if tokenStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Token no proporcionado",
		})
		return
	}

	// Validar el token con la función que tienes para validar el token
	claims, err := auth.ValidateToken(tokenStr) // Usamos tu función validateToken
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Token inválido o expirado",
		})
		return
	}

	// Si el token es válido, extraemos el correo del claim
	email := claims.Email // Asegúrate de que el token contiene el correo en los claims

	// Actualizar el campo email_verificado a true en la base de datos
	_, err = db.Exec("UPDATE estudiantes SET email_verificado = TRUE WHERE email = $1", email)
	if err != nil {
		log.Println("Error al verificar el email:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error al verificar el email",
		})
		return
	}

	// También puedes hacer lo mismo para la tabla de empleadores si es necesario
	_, err = db.Exec("UPDATE empleadores SET email_verificado = TRUE WHERE email = $1", email)
	if err != nil {
		log.Println("Error al verificar el email en empleadores:", err)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Correo electrónico verificado correctamente.",
	})
}
