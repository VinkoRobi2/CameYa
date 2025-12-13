package jobsest

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetAllInteresesHandler(c *gin.Context, db *sql.DB) {

	// ------------------------
	// Obtener ID del estudiante
	// ------------------------
	userIDInterface, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}
	estudianteID := userIDInterface.(int)

	// ------------------------
	// Query: obtener todos los jobs que le interesan al estudiante
	// ------------------------
	query := `
		SELECT 
			j.id,
			j.titulo,
			j.descripcion,
			j.ubicacion,
			j.pago_estimado,
			j.negociable,
			j.requisitos,
			j.categoria,
			j.metodo_pago,
			j.empleador_id,
			j.estado,
			j.creado_en,
			j.actualizado_en,
			j.presencial
		FROM intereses_estudiante ie
		INNER JOIN jobs j ON j.id = ie.job_id
		WHERE ie.estudiante_id = $1
		AND ie.interesado = true;
	`

	type JobResponse struct {
		ID           int            `json:"id"`
		Titulo       string         `json:"titulo"`
		Descripcion  string         `json:"descripcion"`
		Ubicacion    sql.NullString `json:"ubicacion"`
		PagoEstimado float64            `json:"pago_estimado"`
		Negociable   bool           `json:"negociable"`
		Requisitos   string         `json:"requisitos"`
		Categoria    string         `json:"categoria"`
		MetodoPago   string         `json:"metodo_pago"`
		EmpleadorID  int            `json:"empleador_id"`
		Estado       string         `json:"estado"`
		Presencial   bool           `json:"presencial"`
		CreadoEn     string         `json:"creado_en"`
		ActualizadoEn string        `json:"actualizado_en"`
	}

	rows, err := db.Query(query, estudianteID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "No se pudieron obtener los intereses",
			"err":   err.Error(),
		})
		return
	}
	defer rows.Close()

	var jobs []JobResponse

	for rows.Next() {
		var job JobResponse

		err := rows.Scan(
			&job.ID,
			&job.Titulo,
			&job.Descripcion,
			&job.Ubicacion,
			&job.PagoEstimado,
			&job.Negociable,
			&job.Requisitos,
			&job.Categoria,
			&job.MetodoPago,
			&job.EmpleadorID,
			&job.Estado,
			&job.CreadoEn,
			&job.ActualizadoEn,
			&job.Presencial,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Error al leer un trabajo",
				"err":   err.Error(),
			})
			return
		}

		jobs = append(jobs, job)
	}

	// ------------------------
	// Respuesta final
	// ------------------------
	c.JSON(http.StatusOK, gin.H{
		"total": len(jobs),
		"intereses": jobs,
	})
}