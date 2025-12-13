// =======================
// package jobsest
// =======================
package jobsest

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

type InteresRequest struct {
	JobID      int  `json:"job_id"`
	Interesado bool `json:"interesado"` // true = like, false = dislike
}

func GuardarInteresEstudianteHandler(c *gin.Context, db *sql.DB) {

	// Obtener ID del estudiante desde middleware
	userIDInterface, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}
	estudianteID := userIDInterface.(int)

	var req InteresRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JSON inválido"})
		return
	}

	if req.JobID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "job_id es requerido"})
		return
	}

	// Guardar interés del estudiante
	query := `
		INSERT INTO intereses_estudiante (estudiante_id, job_id, interesado)
		VALUES ($1, $2, $3)
		ON CONFLICT (estudiante_id, job_id)
		DO UPDATE SET interesado = EXCLUDED.interesado, creado_en = NOW();
	`

	_, err := db.Exec(query, estudianteID, req.JobID, req.Interesado)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al guardar interés", "err": err.Error()})
		return
	}

	// ---------------------------
	// LÓGICA DE MATCH
	// ---------------------------
	if req.Interesado {

		var empleadorID int
		err = db.QueryRow(`SELECT empleador_id FROM jobs WHERE id = $1`, req.JobID).Scan(&empleadorID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo obtener empleador del job"})
			return
		}

		var interesEmpleador bool
		err = db.QueryRow(`
			SELECT interesado FROM intereses_empleador
			WHERE empleador_id = $1 AND estudiante_id = $2 AND job_id = $3
		`, empleadorID, estudianteID, req.JobID).Scan(&interesEmpleador)

		if err == nil && interesEmpleador {

			_, err = db.Exec(`
				INSERT INTO matches_job (estudiante_id, empleador_id, job_id, is_match)
				VALUES ($1, $2, $3, true)
				ON CONFLICT (estudiante_id, empleador_id, job_id)
				DO UPDATE SET is_match = true;
			`, estudianteID, empleadorID, req.JobID)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear match", "err": err.Error()})
				return
			}

			c.JSON(http.StatusOK, gin.H{"mensaje": "MATCH generado 🔥"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"mensaje": "Interés guardado"})
}