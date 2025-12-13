package emp

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

type EmpleadorInfo struct {
	Nombre     string `json:"nombre"`
	ID         int    `json:"empleador_id"`
	Apellido   string `json:"apellido"`
	Email      string `json:"email"`
	Telefono   string `json:"telefono"`
	LinkedIn   string `json:"linkedin"`
	FacebookIG string `json:"facebook_ig"`
	OtrosLinks string `json:"otros_links"`
}

// Handler: recibe trabajo_id y devuelve datos del dueño del job
func GetOwnerByJobID(db *sql.DB, c *gin.Context) {

	// 1. Leer trabajo_id del body
	var body struct {
		TrabajoID int `json:"trabajo_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "trabajo_id es requerido",
		})
		return
	}

	var empleadorID int
	queryJob := `
		SELECT empleador_id 
		FROM jobs 
		WHERE id = $1
	`
	err := db.QueryRow(queryJob, body.TrabajoID).Scan(&empleadorID)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "El trabajo no existe",
		})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error obteniendo el trabajo",
		})
		return
	}

	// 3. Obtener datos del empleador con links incluidos
	queryUser := `
		SELECT nombre, apellido, email, telefono, linkedin, facebook_ig, otros_links
		FROM empleadores
		WHERE id = $1
	`

	var info EmpleadorInfo
	info.ID = empleadorID // ← AGREGADO AQUÍ

	err = db.QueryRow(
		queryUser,
		empleadorID,
	).Scan(
		&info.Nombre,
		&info.Apellido,
		&info.Email,
		&info.Telefono,
		&info.LinkedIn,
		&info.FacebookIG,
		&info.OtrosLinks,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "No existe el empleador",
		})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error obteniendo datos del empleador",
		})
		return
	}

	// 4. Respuesta final
	c.JSON(http.StatusOK, gin.H{
		"empleador": info,
	})
}