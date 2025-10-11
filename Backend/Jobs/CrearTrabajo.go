package job

import (
	"database/sql"
	"log"
	"net/http"

	auth "github.com/VinkoRobi2/FlashWorkEC/service"
	"github.com/gin-gonic/gin"
	// Asegúrate de importar el paquete auth
)

// Estructura para recibir los datos de creación de un trabajo
type Job struct {
	Titulo        string  `json:"titulo"`
	Descripcion   string  `json:"descripcion"`
	MontoPago     float64 `json:"monto_pago"`
	Duracion      string  `json:"duracion"`      // Aquí puedes parsear a un tipo de datos adecuado
	Datetime      string  `json:"datetime"`      // Fecha y hora del trabajo
	Locacion      string  `json:"locacion"`
	Modalidad     string  `json:"modalidad"`
	Tags          []string `json:"tags"`
	Status        string  `json:"status"`
	IdCreador     int     `json:"id_creador"`    // ID del empleador que crea el trabajo
}

// Función para crear un nuevo trabajo
func CreateJobHandler(c *gin.Context, db *sql.DB) {
	// Verificar el JWT y obtener los claims
	tokenStr := c.GetHeader("Authorization")
	if tokenStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Token de autorización no proporcionado",
		})
		return
	}

	// Validar el token JWT
	claims, err := auth.ValidateToken(tokenStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Token inválido o expirado",
		})
		return
	}

	// Verificar que el usuario tenga el rol de "empleador"
	if claims.Role != "empleador" {
		c.JSON(http.StatusForbidden, gin.H{
			"message": "Solo los empleadores pueden crear trabajos",
		})
		return
	}

	// Obtener los datos del trabajo desde el cuerpo de la solicitud
	var job Job
	if err := c.ShouldBindJSON(&job); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Datos incompletos",
			"error":   err.Error(),
		})
		return
	}

	// Registrar el nuevo trabajo en la base de datos
	query := `
		INSERT INTO jobs (titulo, descripcion, monto_pago, duracion, datetime, locacion, modalidad, tags, status, id_creador)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	_, err = db.Exec(query, job.Titulo, job.Descripcion, job.MontoPago, job.Duracion, job.Datetime, job.Locacion, job.Modalidad, job.Tags, job.Status, claims.UserID) // Usamos `claims.UserID` para obtener el ID del empleador
	if err != nil {
		log.Println("Error al crear el trabajo:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error al crear el trabajo",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Trabajo creado correctamente",
	})
}
