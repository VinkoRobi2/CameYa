package jobsest

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PublicJob struct {
	ID                      int     `json:"id"`
	EmpleadorID             int     `json:"empleador_id"`
	Titulo                  string  `json:"titulo"`
	Descripcion             string  `json:"descripcion"`
	Categoria               string  `json:"categoria"`
	Requisitos              string  `json:"requisitos"`
	Habilidades             string  `json:"habilidades"`
	Salario                 string  `json:"salario"`
	Negociable              bool    `json:"negociable"`
	Ciudad                  string  `json:"ciudad"`
	Modalidad               string  `json:"modalidad"`
	Presencial              bool    `json:"presencial"` // <--- NUEVO
	FechaCreacion           string  `json:"fecha_creacion"`
	PostulacionContratadaID *int    `json:"postulacion_contratada_id"`
	Estado                  string  `json:"estado"`
	FotoJob                 string  `json:"foto_job"`
	FotoEmpleador           string  `json:"foto_empleador"`

	NombreEmpleador   string  `json:"nombre_empleador"`
	ApellidoEmpleador string  `json:"apellido_empleador"`
	RatingEmpleador   float64 `json:"rating_empleador"`
}

func Get_Jobs_Abiertos(c *gin.Context, db *sql.DB) {

	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}
	baseURL := scheme + "://" + c.Request.Host + "/uploads/"

	userIDInterface, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}
	estudianteID := userIDInterface.(int)

	pageStr := c.Query("page")
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit := 10
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 50 {
			limit = l
		}
	}

	offset := (page - 1) * limit

	var total int
	err = db.QueryRow(`
		SELECT COUNT(*) 
		FROM jobs 
		WHERE estado = 'abierto'
		AND id NOT IN (
			SELECT job_id
			FROM intereses_estudiante
			WHERE estudiante_id = $1
		)
	`, estudianteID).Scan(&total)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error obteniendo total de trabajos"})
		return
	}

	totalPages := (total + limit - 1) / limit

	query := `
		SELECT
			j.id,
			j.empleador_id,
			j.titulo,
			j.descripcion,
			j.categoria,
			j.requisitos,
			j.negociable,
			j.ubicacion,
			j.presencial,               -- <--- NUEVO CAMPO
			j.creado_en,
			j.postulacion_contratada_id,
			j.estado,
			j.pago_estimado,
			j.foto_job,
			
			e.foto_perfil,
			e.nombre,
			e.apellido,

			COALESCE((
				SELECT AVG(v.rating)::float
				FROM valoracion_empleador v
				WHERE v.empleador_valorado_id = j.empleador_id
			), 0) AS rating_empleador

		FROM jobs j
		JOIN empleadores e ON e.id = j.empleador_id
		WHERE j.estado = 'abierto'
		AND j.id NOT IN (
			SELECT job_id 
			FROM intereses_estudiante 
			WHERE estudiante_id = $1
		)
		ORDER BY j.creado_en DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := db.Query(query, estudianteID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error al consultar trabajos", "err": err.Error()})
		return
	}
	defer rows.Close()

	jobs := []PublicJob{}

	for rows.Next() {
		var j PublicJob
		var contrID sql.NullInt64
		var fotoJob sql.NullString
		var fotoEmp sql.NullString
		var rating sql.NullFloat64

		err := rows.Scan(
			&j.ID,
			&j.EmpleadorID,
			&j.Titulo,
			&j.Descripcion,
			&j.Categoria,
			&j.Requisitos,
			&j.Negociable,
			&j.Ciudad,
			&j.Presencial, // <--- SCAN DEL NUEVO CAMPO
			&j.FechaCreacion,
			&contrID,
			&j.Estado,
			&j.Salario,
			&fotoJob,

			&fotoEmp,
			&j.NombreEmpleador,
			&j.ApellidoEmpleador,
			&rating,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error leyendo trabajos"})
			return
		}

		if fotoJob.Valid {
			j.FotoJob = baseURL + fotoJob.String
		}

		if fotoEmp.Valid {
			j.FotoEmpleador = baseURL + fotoEmp.String
		}

		if rating.Valid {
			j.RatingEmpleador = rating.Float64
		} else {
			j.RatingEmpleador = 0
		}

		if contrID.Valid {
			val := int(contrID.Int64)
			j.PostulacionContratadaID = &val
		}

		jobs = append(jobs, j)
	}

	c.JSON(http.StatusOK, gin.H{
		"page":        page,
		"total_pages": totalPages,
		"total_jobs":  total,
		"jobs":        jobs,
	})
}