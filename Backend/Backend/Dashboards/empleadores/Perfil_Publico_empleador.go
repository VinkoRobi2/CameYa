package emp

import (
	"database/sql"
	"net/http"
	"strconv"
	"strings"

	auth "github.com/VinkoRobi2/FlashWorkEC/service"
	"github.com/gin-gonic/gin"
)

type EmpleadorPublico struct {
	ID             int      `json:"id"`
	Nombre         string   `json:"nombre"`
	Apellido       string   `json:"apellido"`
	Empresa        string   `json:"empresa"`
	Ciudad         string   `json:"ciudad"`
	SectorLaboral  []string `json:"sector_laboral"`
	FraseCorta     string   `json:"frase_corta"`
	FotoPerfil     string   `json:"foto_perfil"`
	Whatsapp       string   `json:"whatsapp"`
	TipoIdentidad  string   `json:"tipo_identidad"`
}

func Get_Empleadores_Publicos_List(c *gin.Context, db *sql.DB) {
	// 1. Validar JWT
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "token faltante"})
		return
	}

	tokenStr := authHeader[7:]
	_, err := auth.ValidateToken(tokenStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "token inválido o expirado"})
		return
	}

	// 2. Paginación
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}

	offset := (page - 1) * limit

	// 3. Query pública
	query := `
		SELECT 
			id,
			nombre,
			apellido,
			ciudad,
			area_actividad_principal,
			frase_corta,
			foto_perfil,
			whatsapp,
			tipo_identidad
		FROM empleadores
		ORDER BY id DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := db.Query(query, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var result []EmpleadorPublico

	for rows.Next() {
		var emp EmpleadorPublico
		var sectorStr string

		err := rows.Scan(
			&emp.ID,
			&emp.Nombre,
			&emp.Apellido,
			&emp.Ciudad,
			&sectorStr,
			&emp.FraseCorta,
			&emp.FotoPerfil,
			&emp.Whatsapp,
			&emp.TipoIdentidad,
		)

		if err != nil {
			continue
		}

		// CSV → slice
		if sectorStr != "" {
			emp.SectorLaboral = strings.Split(sectorStr, ",")
		} else {
			emp.SectorLaboral = []string{}
		}

		result = append(result, emp)
	}

	c.JSON(http.StatusOK, gin.H{
		"page":        page,
		"limit":       limit,
		"empleadores": result,
	})
}