package jobsest

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetMatchesEstudianteHandler(ctx *gin.Context, db *sql.DB) {

	userIDInterface, ok := ctx.Get("userID")
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	estudianteID := userIDInterface.(int)

	// --------------------------------------------------------------
	// AGREGADO: m.id AS match_id
	// --------------------------------------------------------------
	query := `
		SELECT 
			m.id AS match_id,

			e.id AS empleador_id,
			e.nombre,
			e.apellido,
			e.foto_perfil,

			j.id AS job_id,
			j.titulo,
			j.descripcion,
			j.pago_estimado
		FROM matches_job m
		JOIN empleadores e ON m.empleador_id = e.id
		JOIN jobs j ON m.job_id = j.id
		WHERE m.estudiante_id = $1 AND m.is_match = true;
	`

	rows, err := db.Query(query, estudianteID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener matches", "err": err.Error()})
		return
	}
	defer rows.Close()

	type MatchResponse struct {
		MatchID             int     `json:"match_id"`

		EmpleadorID         int     `json:"empleador_id"`
		EmpleadorNombre     string  `json:"empleador_nombre"`
		EmpleadorApellido   string  `json:"empleador_apellido"`
		EmpleadorFotoPerfil string  `json:"empleador_foto_perfil"`

		JobID               int     `json:"job_id"`
		JobTitulo           string  `json:"job_titulo"`
		JobDescripcion      string  `json:"job_descripcion"`
		JobPago             float64 `json:"job_pago_estimado"`
	}

	var matches []MatchResponse

	for rows.Next() {
		var m MatchResponse

		// --------------------------------------------------------------
		// IMPORTANTE: coincide EXACTO con el SELECT
		// --------------------------------------------------------------
		if err := rows.Scan(
			&m.MatchID,

			&m.EmpleadorID,
			&m.EmpleadorNombre,
			&m.EmpleadorApellido,
			&m.EmpleadorFotoPerfil,

			&m.JobID,
			&m.JobTitulo,
			&m.JobDescripcion,
			&m.JobPago,
		); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar resultados", "err": err.Error()})
			return
		}

		matches = append(matches, m)
	}

	ctx.JSON(http.StatusOK, gin.H{
		"matches": matches,
	})
}