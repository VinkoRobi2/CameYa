package jobsemp

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
)

func GetLikesDeEstudiantesParaEmpleador(c *gin.Context, db *sql.DB) {

	// Obtener empleador_id desde token
	userIDInterface, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}
	empleadorID := userIDInterface.(int)

	query := `
		SELECT 
			e.id,
			e.nombre,
			e.apellido,
			e.foto_perfil,
			e.habilidades_basicas,
			e.biografia,
			e.disponibilidad_de_tiempo,
			e.links,
			e.universidad,
			e.ciudad,
			ie.job_id
		FROM intereses_estudiante ie
		JOIN estudiantes e ON e.id = ie.estudiante_id
		JOIN jobs t ON t.id = ie.job_id
		WHERE t.empleador_id = $1
		  AND ie.interesado = true;
	`

	rows, err := db.Query(query, empleadorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo intereses", "err": err.Error()})
		return
	}
	defer rows.Close()

	type EstudianteLike struct {
		ID             int      `json:"id"`
		Nombre         string   `json:"nombre"`
		Apellido       string   `json:"apellido"`
		FotoPerfil     string   `json:"foto_perfil"`
		Habilidades    []string `json:"habilidades_basicas"`
		Biografia      string   `json:"biografia"`
		Disponibilidad string   `json:"disponibilidad_de_tiempo"`
		Links          string   `json:"links"`
		Universidad    string   `json:"universidad"`
		Ciudad         string   `json:"ciudad"`
		JobID          int      `json:"job_id"`
		Valoracion     float64  `json:"valoracion"`
	}

	var lista []EstudianteLike

	for rows.Next() {
		var e EstudianteLike
		var habilidadesRaw pq.StringArray

		err := rows.Scan(
			&e.ID,
			&e.Nombre,
			&e.Apellido,
			&e.FotoPerfil,
			&habilidadesRaw,
			&e.Biografia,
			&e.Disponibilidad,
			&e.Links,
			&e.Universidad,
			&e.Ciudad,
			&e.JobID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error leyendo datos", "err": err.Error()})
			return
		}

		e.Habilidades = habilidadesRaw

		// =====================================
		// VERIFICAR SI YA EXISTE MATCH
		// =====================================
		var isMatch bool
		err = db.QueryRow(`
			SELECT is_match 
			FROM matches_job
			WHERE estudiante_id = $1 
			  AND empleador_id = $2 
			  AND job_id = $3
		`, e.ID, empleadorID, e.JobID).Scan(&isMatch)

		if err == nil && isMatch {
			// YA HAY MATCH → NO ENVIARLO
			continue
		}

		// =====================================
		// Obtener la valoración del estudiante
		// =====================================
		err = db.QueryRow(`
			SELECT COALESCE(AVG(rating), 0)
			FROM valoracion_estudiante
			WHERE estudiante_valorado_id = $1
		`, e.ID).Scan(&e.Valoracion)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo valoración", "err": err.Error()})
			return
		}

		lista = append(lista, e)
	}

	c.JSON(http.StatusOK, gin.H{
		"total":     len(lista),
		"intereses": lista,
	})
}