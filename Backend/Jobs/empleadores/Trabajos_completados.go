package jobsemp

import (
	"database/sql"
	"errors"
	"net/http"
	"strings"
	"time"

	auth "github.com/VinkoRobi2/FlashWorkEC/service"
	"github.com/gin-gonic/gin"
)

// ---- STRUCT DE RESPUESTA FINAL ----

type TrabajoCompletadoEmpleador struct {
	TrabajoID          int     `json:"trabajo_id"`
	Titulo             string  `json:"titulo"`
	Descripcion        string  `json:"descripcion"`
	Categoria          string  `json:"categoria"`
	Ubicacion          string  `json:"ubicacion"`
	PagoEstimado       float64 `json:"pago_estimado"`

	PostulacionID      int     `json:"postulacion_id"`
	EstudianteID       int     `json:"estudiante_id"`
	NombreEstudiante   string  `json:"nombre_estudiante"`
	ApellidoEstudiante string  `json:"apellido_estudiante"`

	FechaPostulacion   string  `json:"fecha_postulacion"`
	FechaCompletado    string  `json:"fecha_completado"`
	FechaTrabajo       string  `json:"fecha_trabajo"`
}

// ---- JWT ----

func getEmployerIdFromJWT(c *gin.Context) (int, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return 0, errors.New("authorization header faltante")
	}
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return 0, errors.New("token inválido")
	}

	tokenStr := authHeader[7:]
	claims, err := auth.ValidateToken(tokenStr)
	if err != nil {
		return 0, err
	}
	if claims.UserID == 0 {
		return 0, errors.New("user_id vacío en token")
	}

	return claims.UserID, nil
}

// ---- HANDLER ----

func GetTrabajosCompletadosEmpleador(db *sql.DB, c *gin.Context) {
	employerID, err := getEmployerIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido", "detail": err.Error()})
		return
	}

	query := `
	SELECT
		j.id,
		j.titulo,
        j.descripcion,
        j.categoria,
        j.ubicacion,
        j.pago_estimado,

		ja.id AS postulacion_id,
		ja.estudiante_id,
		e.nombre,
		e.apellido,

        ja.creado_en AS fecha_postulacion,
		j.actualizado_en AS fecha_trabajo,
		ja.actualizado_en AS fecha_completado

	FROM job_applications ja
	JOIN jobs j ON j.id = ja.trabajo_id
	JOIN estudiantes e ON e.id = ja.estudiante_id

	WHERE j.empleador_id = $1
	  AND ja.student_completed = TRUE
	  AND ja.employer_completed = TRUE

	ORDER BY ja.actualizado_en DESC
	`

	rows, err := db.Query(query, employerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error en la consulta", "detail": err.Error()})
		return
	}
	defer rows.Close()

	var trabajos []TrabajoCompletadoEmpleador

	for rows.Next() {
		var t TrabajoCompletadoEmpleador

		var fechaPost time.Time
		var fechaJob time.Time
		var fechaDone time.Time
		var pago sql.NullFloat64

		err := rows.Scan(
			&t.TrabajoID,
			&t.Titulo,
			&t.Descripcion,
			&t.Categoria,
			&t.Ubicacion,
			&pago,

			&t.PostulacionID,
			&t.EstudianteID,
			&t.NombreEstudiante,
			&t.ApellidoEstudiante,

			&fechaPost,
			&fechaJob,
			&fechaDone,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error escaneando datos", "detail": err.Error()})
			return
		}

		if pago.Valid {
			t.PagoEstimado = pago.Float64
		}

		t.FechaPostulacion = fechaPost.Format(time.RFC3339)
		t.FechaTrabajo = fechaJob.Format(time.RFC3339)
		t.FechaCompletado = fechaDone.Format(time.RFC3339)

		trabajos = append(trabajos, t)
	}

	c.JSON(http.StatusOK, gin.H{
		"trabajos_completados": trabajos,
	})
}