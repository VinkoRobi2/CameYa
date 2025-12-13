package emp

import (
	"database/sql"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)



type Perfil_Empleador_Publico struct {
	Nombre        string   `json:"nombre"`
	Apellido      string   `json:"apellido"`
	Empresa       string   `json:"empresa"`
	Ciudad        string   `json:"ciudad"`
	SectorLaboral []string `json:"sector_laboral"`
	Biografia     string   `json:"biografia"`
	Links         []string `json:"links"`
	FraseCorta    string   `json:"frase_corta"`
	FotoPerfil    string   `json:"foto_perfil"`
	Linkedin      string   `json:"linkedin"`
	Whatsapp      string   `json:"whatsapp"`
	TipoIdentidad string   `json:"tipo_identidad"`
}

func Get_Empleador_Publico_Info(c *gin.Context, db *sql.DB) {

	// Validar JWT (solo para permitir acceso)
	_, err := getUserIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// ID del empleador público
	empleadorId := c.Param("id")
	if empleadorId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id requerido"})
		return
	}

	query := `
		SELECT 
			nombre,
			apellido,
			empresa,
			ciudad,
			area_actividad_principal,
			biografia,
			otros_links,
			frase_corta,
			foto_perfil,
			linkedin,
			whatsapp,
			tipo_identidad
		FROM empleadores
		WHERE id = $1
	`

	var (
		sectorStr string
		linksStr  string
	)

	var perfil Perfil_Empleador_Publico

	err = db.QueryRow(query, empleadorId).Scan(
		&perfil.Nombre,
		&perfil.Apellido,
		&perfil.Empresa,
		&perfil.Ciudad,
		&sectorStr,
		&perfil.Biografia,
		&linksStr,
		&perfil.FraseCorta,
		&perfil.FotoPerfil,
		&perfil.Linkedin,
		&perfil.Whatsapp,
		&perfil.TipoIdentidad,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "empleador no encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// CSV -> slices
	if sectorStr != "" {
		perfil.SectorLaboral = strings.Split(sectorStr, ",")
	} else {
		perfil.SectorLaboral = []string{}
	}

	if linksStr != "" {
		perfil.Links = strings.Split(linksStr, ",")
	} else {
		perfil.Links = []string{}
	}

	c.JSON(http.StatusOK, perfil)
}