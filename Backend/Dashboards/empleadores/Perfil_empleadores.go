package emp

import (
	"database/sql"
	"net/http"
	"strings"
	"errors"

	auth "github.com/VinkoRobi2/FlashWorkEC/service"
	"github.com/gin-gonic/gin"
)

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

type Perfil_Empleador struct {
	Nombre                  string   `json:"nombre"`
	Apellido                string   `json:"apellido"`
	Empresa                 string   `json:"empresa"`
	RUC                     string   `json:"ruc"`
	Cedula                  string   `json:"cedula"`
	Email                   string   `json:"email"`
	Telefono                string   `json:"telefono"`
	Ciudad                  string   `json:"ciudad"`
	SectorLaboral           []string `json:"sector_laboral"`
	Biografia               string   `json:"biografia"`
	Links                   []string `json:"links"`
	FechaNacimiento         string   `json:"fecha_nacimiento"`
	PreferenciasCats        string   `json:"preferencias_categorias"`
	FraseCorta              string   `json:"frase_corta"`
	FotoPerfil              string   `json:"foto_perfil"`
	Whatsapp                string   `json:"whatsapp"`
	Linkedin                string   `json:"linkedin"`
	TipoIdentidad           string   `json:"tipo_identidad"`
	TotalEstudiantes        int      `json:"total_estudiantes_contratados"`
	RatingPromedio          float64  `json:"rating_promedio"`
	TotalTrabajosPublicados int      `json:"total_trabajos_publicados"`
}

func Get_Empleador_Info(c *gin.Context, db *sql.DB) {
	userId, err := getUserIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"err": err.Error()})
		return
	}

	query := `
		SELECT 
			nombre,
			apellido,
			cedula_ruc,
			email,
			telefono,
			ciudad,
			area_actividad_principal,
			biografia,
			otros_links,
			foto_perfil,
			whatsapp,
			linkedin,
			tipo_identidad
		FROM empleadores
		WHERE id = $1
	`

	var (
		sectorStr string
		linksStr  string
		cedulaRuc sql.NullString
	)

	var perfil Perfil_Empleador

	err = db.QueryRow(query, userId).Scan(
		&perfil.Nombre,
		&perfil.Apellido,
		&cedulaRuc, // 🔥 FIX: evita error cuando viene NULL
		&perfil.Email,
		&perfil.Telefono,
		&perfil.Ciudad,
		&perfil.Biografia,
		&linksStr,
		&perfil.PreferenciasCats,
		&perfil.FotoPerfil,
		&perfil.Whatsapp,
		&perfil.Linkedin,
		&perfil.TipoIdentidad,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"err": "empleador no encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"err": err.Error()})
		return
	}

	// Convertimos el NULL a string vacío si viene NULL
	perfil.Cedula = cedulaRuc.String

	// CSV a slice
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

	// Total estudiantes contratados
	queryEstudiantes := `
		SELECT COUNT(DISTINCT estudiante_valorador_id)
		FROM Valoracion_empleador
		WHERE empleador_valorado_id = $1
	`
	if err := db.QueryRow(queryEstudiantes, userId).Scan(&perfil.TotalEstudiantes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err.Error()})
		return
	}

	// Promedio de rating
	queryRating := `
		SELECT COALESCE(AVG(rating), 0)
		FROM Valoracion_empleador
		WHERE empleador_valorado_id = $1
	`
	if err := db.QueryRow(queryRating, userId).Scan(&perfil.RatingPromedio); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err.Error()})
		return
	}

	// Total trabajos publicados
	queryJobs := `
		SELECT COUNT(*)
		FROM jobs
		WHERE empleador_id = $1
	`
	if err := db.QueryRow(queryJobs, userId).Scan(&perfil.TotalTrabajosPublicados); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err.Error()})
		return
	}

	c.JSON(http.StatusOK, perfil)
}