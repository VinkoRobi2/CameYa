package jobsemp

import (
	"database/sql"
	"net/http"
	"strings"
	"errors"

	auth "github.com/VinkoRobi2/FlashWorkEC/service"
	"github.com/gin-gonic/gin"
)

type Job struct {
	ID                      int     `json:"id"`
	Titulo                  string  `json:"titulo"`
	Descripcion             string  `json:"descripcion"`
	Categoria               string  `json:"categoria"`          // STRING
	Requisitos              string  `json:"requisitos"`         // STRING
       // STRING
	Salario                 string  `json:"salario"`
	Negociable              bool    `json:"negociable"`
	Ciudad                  string  `json:"ciudad"`
	Modalidad               string  `json:"modalidad"`
	FechaCreacion           string  `json:"fecha_creacion"`
		Estado       string  `json:"estado"`
	PostulacionContratadaID *int    `json:"postulacion_contratada_id"`
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

func Get_Mis_Jobs(c *gin.Context, db *sql.DB) {
	userId, err := getUserIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	query := `
		SELECT
			id,
			titulo,
			descripcion,
			categoria,
			requisitos,
			pago_estimado,
			negociable,
			ubicacion,

			requisitos,
			estado,
			creado_en,
			postulacion_contratada_id
		FROM jobs
		WHERE empleador_id = $1
		ORDER BY creado_en DESC
	`

	rows, err := db.Query(query, userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error al consultar jobs", "err":err.Error()})
		return
	}
	defer rows.Close()

	jobs := []Job{}

	for rows.Next() {
		var j Job
		var (
			catStr  string
			reqStr  string
			contrID sql.NullInt64
		)

		err := rows.Scan(
			&j.ID,
			&j.Titulo,
			&j.Descripcion,
			&catStr,
			&reqStr,
			&j.Salario,
			&j.Negociable,
			&j.Ciudad,
			&j.Requisitos,
			&j.Estado,
			&j.FechaCreacion,
			&contrID,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error al leer datos"})
			return
		}

		// ✔️ Convertir CSV → string (sin arrays)
		j.Categoria = catStr
		j.Requisitos = reqStr

		// ✔️ nullable FK
		if contrID.Valid {
			val := int(contrID.Int64)
			j.PostulacionContratadaID = &val
		} else {
			j.PostulacionContratadaID = nil
		}

		jobs = append(jobs, j)
	}

	c.JSON(http.StatusOK, gin.H{
		"jobs": jobs,
	})
}