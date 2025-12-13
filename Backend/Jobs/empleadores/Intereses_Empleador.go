// =======================
// package jobsemp
// =======================
package jobsemp

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

type InteresEmpleadorRequest struct {
	EstudianteID int  `json:"estudiante_id"`
	Interesado   bool `json:"like"`
	JobID        int  `json:"job_id"`
}

func GuardarInteresEmpleadorHandler(c *gin.Context, db *sql.DB) {

	userIDInterface, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}
	empleadorID := userIDInterface.(int)

	var req InteresEmpleadorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JSON inválido"})
		return
	}

	if req.EstudianteID == 0 || req.JobID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "estudiante_id y job_id son requeridos"})
		return
	}

	// -------------------------------------------
	// GUARDAR INTERÉS DEL EMPLEADOR
	// -------------------------------------------
	query := `
		INSERT INTO intereses_empleador (empleador_id, estudiante_id, job_id, interesado)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (empleador_id, estudiante_id, job_id)
		DO UPDATE SET interesado = EXCLUDED.interesado, creado_en = NOW();
	`

	_, err := db.Exec(query, empleadorID, req.EstudianteID, req.JobID, req.Interesado)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al guardar interés", "err": err.Error()})
		return
	}

	// -------------------------------------------
	// LÓGICA DE MATCH (AMBOS DIERON LIKE)
	// -------------------------------------------
	if req.Interesado {

		var interesEstudiante bool
		err = db.QueryRow(`
			SELECT interesado 
			FROM intereses_estudiante
			WHERE estudiante_id = $1 AND job_id = $2
		`, req.EstudianteID, req.JobID).Scan(&interesEstudiante)

		if err == nil && interesEstudiante {

			// *** CAMBIO AQUÍ ***
			// Antes ponías "match", ahora usamos is_match
			_, err = db.Exec(`
				INSERT INTO matches_job (estudiante_id, empleador_id, job_id, is_match)
				VALUES ($1, $2, $3, true)
				ON CONFLICT (estudiante_id, empleador_id, job_id)
				DO UPDATE SET is_match = true;
			`, req.EstudianteID, empleadorID, req.JobID)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo crear el match", "err": err.Error()})
				return
			}

			c.JSON(http.StatusOK, gin.H{"mensaje": "MATCH generado 🔥"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"mensaje": "Interés guardado"})
}
