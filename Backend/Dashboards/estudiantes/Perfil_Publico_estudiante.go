package estud

import (
	"database/sql"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// Estructura pública
type Perfil_Estudiante_Publico struct {
	Nombre               string   `json:"nombre"`
	Apellido             string   `json:"apellido"`

	Biografia string 	`json:"biografia"`
	Ciudad               string   `json:"ciudad"`
	Carrera              string   `json:"carrera"`
	Universidad          string   `json:"universidad"`
	HabilidadesBasicas   []string `json:"habilidades_basicas"`
	FotoPerfil           string   `json:"foto_perfil"`
	Whatsapp             string   `json:"whatsapp"`
	Links string `json:"links"`
	DisponibilidadTiempo string   `json:"disponibilidad_de_tiempo"`
	Email                string   `json:"email"`
}

func Get_Estudiante_Publicos_List(c *gin.Context, db *sql.DB) {
	// Validar JWT (necesario para ver los perfiles)
	_, err := getUserIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"err": err.Error()})
		return
	}

	// PAGINACIÓN
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	offset := (page - 1) * limit

	query := `
		SELECT 
			nombre,
			apellido,
			ciudad,
			carrera,
			universidad,
			habilidades_basicas,
			foto_perfil,
			telefono,
			biografia,
			disponibilidad_de_tiempo
		FROM estudiantes
		WHERE perfil_completo = true
		ORDER BY id DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := db.Query(query, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err.Error()})
		return
	}
	defer rows.Close()

	perfiles := []Perfil_Estudiante_Publico{}

	for rows.Next() {
		var (
			habilidadesStr string
			telefono       string
			p              Perfil_Estudiante_Publico
		)

		err := rows.Scan(
			&p.Nombre,
			&p.Apellido,
			&p.Ciudad,
			&p.Carrera,
			&p.Universidad,
			&habilidadesStr,
			&p.FotoPerfil,
			&telefono,
			&p.Biografia,
			&p.DisponibilidadTiempo,
		)
		if err != nil {
			continue
		}



		if habilidadesStr != "" {
			p.HabilidadesBasicas = strings.Split(habilidadesStr, ",")
		} else {
			p.HabilidadesBasicas = []string{}
		}

		// WHATSAPP (solo número)
		p.Whatsapp = telefono

		perfiles = append(perfiles, p)
	}

	c.JSON(http.StatusOK, gin.H{
		"page":  page,
		"limit": limit,
		"data":  perfiles,
		"count": len(perfiles),
	})
}
