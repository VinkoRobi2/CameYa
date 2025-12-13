package jobsest

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func BrowseEmpleadoresHandler(ctx *gin.Context, db *sql.DB) {

	query := `
SELECT 
    e.id AS empleador_id,
    e.nombre,
    e.apellido,
    e.razon_social,
    e.biografia,
    e.ciudad,
    e.foto_perfil,                      -- FOTO DEL EMPLEADOR
    COALESCE(AVG(r.rating), 0) AS promedio_rating,
    COUNT(r.rating) AS total_reviews
FROM empleadores e
LEFT JOIN valoracion_empleador r ON r.empleador_valorado_id = e.id
GROUP BY e.id
ORDER BY promedio_rating DESC;
`

	rows, err := db.Query(query)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error al obtener empleadores",
			"err":   err.Error(),
		})
		return
	}
	defer rows.Close()

	type Job struct {
		ID          int    `json:"id"`
		Titulo      string `json:"titulo"`
		Descripcion string `json:"descripcion"`
		Pago        string `json:"pago_estimado"`
		Foto        string `json:"foto"` // FOTO DEL JOB ACTIVO
	}

	type EmpleadorResponse struct {
		EmpleadorID    int     `json:"empleador_id"`
		Nombre         string  `json:"nombre"`
		Apellido       string  `json:"apellido"`
		Empresa        string  `json:"empresa"`
		Biografia      string  `json:"biografia"`
		Ciudad         string  `json:"ciudad"`
		FotoPerfil     string  `json:"foto_perfil"` // FOTO DEL EMPLEADOR
		PromedioRating float64 `json:"promedio_rating"`
		TotalReviews   int     `json:"total_reviews"`
		Trabajos       []Job   `json:"trabajos_activos"`
	}

	var empleadores []EmpleadorResponse

	for rows.Next() {
		var emp EmpleadorResponse
		var empresa sql.NullString
		var bio sql.NullString
		var ciudad sql.NullString
		var fotoPerfil sql.NullString

		if err := rows.Scan(
			&emp.EmpleadorID,
			&emp.Nombre,
			&emp.Apellido,
			&empresa,
			&bio,
			&ciudad,
			&fotoPerfil,              // FOTO
			&emp.PromedioRating,
			&emp.TotalReviews,
		); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": "Error al procesar resultados",
				"err":   err.Error(),
			})
			return
		}

		emp.Empresa = empresa.String
		emp.Biografia = bio.String
		emp.Ciudad = ciudad.String
		emp.FotoPerfil = fotoPerfil.String

		// ↓ sacar trabajos activos del empleador
		jobQuery := `
			SELECT id, titulo, descripcion, pago_estimado, foto_job
			FROM jobs 
			WHERE empleador_id = $1 AND estado = 'abierto';
		`

		jobRows, err := db.Query(jobQuery, emp.EmpleadorID)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error": "Error obteniendo trabajos",
				"err":   err.Error(),
			})
			return
		}

		var trabajos []Job

		for jobRows.Next() {
			var j Job
			var fotoJob sql.NullString

			if err := jobRows.Scan(
				&j.ID,
				&j.Titulo,
				&j.Descripcion,
				&j.Pago,
				&fotoJob, // FOTO DEL JOB
			); err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{
					"error": "Error leyendo trabajos",
					"err":   err.Error(),
				})
				return
			}

			j.Foto = fotoJob.String
			trabajos = append(trabajos, j)
		}
		jobRows.Close()

		emp.Trabajos = trabajos
		empleadores = append(empleadores, emp)
	}

	ctx.JSON(http.StatusOK, gin.H{
		"empleadores": empleadores,
	})
}