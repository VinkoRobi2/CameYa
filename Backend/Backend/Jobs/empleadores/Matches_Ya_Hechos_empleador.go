package jobsemp

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetMatchesEmpleadorHandler(ctx *gin.Context, db *sql.DB) {

	userIDInterface, ok := ctx.Get("userID")
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	empleadorID := userIDInterface.(int)

	// ------------------------------------------------------------------
	// Seleccionamos también m.id como match_id
	// ------------------------------------------------------------------
	query := `
		SELECT 
			m.id,
			e.id,
			e.nombre,
			e.apellido,
			e.foto_perfil,
			e.carrera,
			e.universidad,
			j.id,
			j.titulo,
			j.descripcion
		FROM matches_job m
		JOIN estudiantes e ON m.estudiante_id = e.id
		JOIN jobs j ON m.job_id = j.id
		WHERE m.empleador_id = $1 AND m.is_match = true;
	`

	rows, err := db.Query(query, empleadorID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener matches", "err": err.Error()})
		return
	}
	defer rows.Close()

	type MatchResponse struct {
		MatchID        int    `json:"match_id"`
		EstudianteID   int    `json:"estudiante_id"`
		Nombre         string `json:"nombre"`
		Apellido       string `json:"apellido"`
		FotoPerfil     string `json:"foto_perfil"`
		Carrera        string `json:"carrera"`
		Universidad    string `json:"universidad"`
		JobID          int    `json:"job_id"`
		JobTitulo      string `json:"job_titulo"`
		JobDescripcion string `json:"job_descripcion"`
	}

	var matches []MatchResponse

	for rows.Next() {
		var m MatchResponse
		if err := rows.Scan(
			&m.MatchID,
			&m.EstudianteID,
			&m.Nombre,
			&m.Apellido,
			&m.FotoPerfil,
			&m.Carrera,
			&m.Universidad,
			&m.JobID,
			&m.JobTitulo,
			&m.JobDescripcion,
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