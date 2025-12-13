package estud

import (
	"database/sql"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func Get_Estudiante_Publico_By_ID(c *gin.Context, db *sql.DB) {

	// Validar JWT
	_, err := getUserIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"err": err.Error()})
		return
	}

	// ID desde la URL
	idStr := c.Param("id")
	estID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": "ID inválido"})
		return
	}

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
			disponibilidad_de_tiempo,
			links,
			email
		FROM estudiantes
		WHERE id = $1 AND perfil_completo = true
		LIMIT 1
	`

	var (
		habilidadesStr string
		telefono       string
		links          string
		email          string
		p              Perfil_Estudiante_Publico
	)

	err = db.QueryRow(query, estID).Scan(
		&p.Nombre,
		&p.Apellido,

		&p.Ciudad,
		&p.Carrera,
		&p.Universidad,
		&habilidadesStr,
		&p.FotoPerfil,
		&telefono,
		&p.DisponibilidadTiempo,
		&links,
		&email,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"err": "Estudiante no encontrado"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err.Error()})
		return
	}

	// CSV → slice

	if habilidadesStr != "" {
		p.HabilidadesBasicas = strings.Split(habilidadesStr, ",")
	}

	p.Whatsapp = telefono
	p.Links = links
	p.Email = email

	// Respuesta
	c.JSON(http.StatusOK, gin.H{
		"data": p,
	})
}
