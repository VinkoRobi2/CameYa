package jobsest

import (
	"database/sql"
	"errors"
	"net/http"
	"strings"

	auth "github.com/VinkoRobi2/FlashWorkEC/service"
	"github.com/gin-gonic/gin"
)

// Estructura de un trabajo completado
type TrabajoCompletado struct {
	PostulacionID    int     `json:"postulacion_id"`
	TrabajoID        int     `json:"trabajo_id"`
	Titulo           string  `json:"titulo"`
	Descripcion      string  `json:"descripcion"`
	Precio           float64 `json:"precio"`
	FechaPostulacion string  `json:"fecha_postulacion"`
	FechaTrabajo     string  `json:"fecha_trabajo"`
}

func getUserIdFromJWT(c *gin.Context) (int, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return 0, errors.New("authorization header faltante")
	}

	if !strings.HasPrefix(authHeader, "Bearer ") {
		return 0, errors.New("formato de token inválido")
	}

	tokenStr := authHeader[7:]
	claims, err := auth.ValidateToken(tokenStr)
	if err != nil {
		return 0, errors.New("token inválido o expirado")
	}

	if claims.UserID == 0 {
		return 0, errors.New("user_id no encontrado en las claims")
	}

	return claims.UserID, nil
}

// Handler para obtener los trabajos completados por el estudiante
func GetTrabajosCompletadosEstudiante(db *sql.DB, c *gin.Context) {

	// Sacar estudiante_id del token
	estudianteID, err := getUserIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "No se pudo obtener el usuario del token",
		})
		return
	}

	// Query: trabajos donde ambos completaron
	query := `
		SELECT 
			ja.id,
			j.id,
			j.titulo,
			j.descripcion,
			CAST(j.pago_estimado AS FLOAT) AS precio,
			ja.creado_en AS fecha_postulacion,
			j.creado_en AS fecha_trabajo
		FROM job_applications ja
		JOIN jobs j ON j.id = ja.trabajo_id
		WHERE ja.estudiante_id = $1
		AND ja.student_completed = TRUE
		AND ja.employer_completed = TRUE
		ORDER BY ja.creado_en DESC
	`

	rows, err := db.Query(query, estudianteID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Error al obtener trabajos completados",
			"message": err.Error(),
		})
		return
	}
	defer rows.Close()

	trabajos := []TrabajoCompletado{}

	for rows.Next() {
		var t TrabajoCompletado

		err := rows.Scan(
			&t.PostulacionID,
			&t.TrabajoID,
			&t.Titulo,
			&t.Descripcion,
			&t.Precio,
			&t.FechaPostulacion,
			&t.FechaTrabajo,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Error al leer resultados",
				"err":   err.Error(),
			})
			return
		}

		trabajos = append(trabajos, t)
	}

	// Respuesta final
	c.JSON(http.StatusOK, gin.H{
		"trabajos_completados": trabajos,
		"idest":estudianteID,
	})
}