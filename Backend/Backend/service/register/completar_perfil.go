package registro

import (
	
	"database/sql"
	"encoding/base64"
	"errors"
	
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	auth "github.com/VinkoRobi2/FlashWorkEC/service"
	"github.com/gin-gonic/gin"
)

// ==================== REQUESTS ====================

type ProfileUpdateRequest struct {
	Ciudad           string   `json:"ciudad"`
	Telefono         string   `json:"telefono"`
	Carrera          string   `json:"carrera"`
	Universidad      string   `json:"universidad"`
	Habilidades      []string `json:"habilidades"`
	Disponibilidad   string   `json:"disponibilidad"`
	Biografia        string   `json:"biografia"`
	FotoPerfil       string   `json:"foto_perfil"`
	FotoPerfilBase64 string   `json:"foto_perfil_base64"`
	Links            []string `json:"links"`
	PerfilCompleto   bool     `json:"perfil_completo"`
}

type EmployerProfileUpdateRequest struct {
	TipoIdentidad          string `json:"tipo_identidad"` // viene del request
	FotoPerfilBase64       string `json:"foto_perfil_base64"`
	LogoEmpresa            string `json:"logo_empresa"`
	Biografia              string `json:"biografia"`
	Whatsapp               string `json:"whatsapp"`
	Linkedin               string `json:"linkedin"`
	FacebookIG             string `json:"facebook_ig"`
	LogoEmpresaBase64 string `json:"facebook_fghig"`

	OtrosLinks             string `json:"otros_links"`
	DominioCorporativo     string `json:"dominio_corporativo"`
	RazonSocial            string `json:"razon_social"`
	AreaActividadPrincipal string `json:"area_actividad_principal"`
	DescripcionEmpresa     string `json:"descripcion_empresa"`
}

// ==================== JWT ====================

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

// ==================== WORKER ====================

func UpdateWorkerProfileHandler(c *gin.Context, db *sql.DB) {
	userId, err := getUserIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
		return
	}

	var input ProfileUpdateRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Error al procesar los datos", "details": err.Error()})
		return
	}

	if len(input.Habilidades) == 0 || input.Disponibilidad == "" || input.Biografia == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Debes completar al menos habilidades, disponibilidad y biografía."})
		return
	}

	fotoURL := strings.TrimSpace(input.FotoPerfil)

	// Imagen
	if input.FotoPerfilBase64 != "" {
		data, err := base64.StdEncoding.DecodeString(input.FotoPerfilBase64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "foto_perfil_base64 inválido"})
			return
		}

		os.MkdirAll("./uploads", 0755)

		filename := filepath.Join("./uploads", "estudiante_"+strconv.Itoa(userId)+".png")
		os.WriteFile(filename, data, 0644)

		fotoURL = "http://" + c.Request.Host + "/uploads/" + "estudiante_" + strconv.Itoa(userId) + ".png"
	}

	habilidadesString := "{" + strings.Join(input.Habilidades, ",") + "}"
	linksString := strings.Join(input.Links, ",")

	profileComplete := len(input.Habilidades) > 0 &&
		input.Disponibilidad != "" &&
		input.Biografia != "" &&
		input.Ciudad != "" &&
		input.Universidad != ""

	query := `
		UPDATE estudiantes SET
			foto_perfil = $1,
			habilidades_basicas = $2,
			disponibilidad_de_tiempo = $3,
			biografia = $4,
			links = $5,
			ciudad = $6,
			telefono = $7,
			carrera = $8,
			universidad = $9,
			perfil_completo = $10
		WHERE id = $11
	`

	_, err = db.Exec(
		query,
		fotoURL,
		habilidadesString,
		input.Disponibilidad,
		input.Biografia,
		linksString,
		input.Ciudad,
		input.Telefono,
		input.Carrera,
		input.Universidad,
		profileComplete,
		userId,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error al actualizar el perfil"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":          "Perfil actualizado correctamente",
		"profile_completo": profileComplete,
		"foto_perfil":      fotoURL,
	})
}

// ==================== EMPLEADOR: helpers / GET PERFIL ====================

// helper: arma links solo desde whatsapp / linkedin / facebook_ig / otros_links
func buildEmployerLinks(whatsapp, linkedin, facebookIG, otros string) []string {
	links := []string{}

	if strings.TrimSpace(whatsapp) != "" {
		links = append(links, whatsapp)
	}
	if strings.TrimSpace(linkedin) != "" {
		links = append(links, linkedin)
	}
	if strings.TrimSpace(facebookIG) != "" {
		links = append(links, facebookIG)
	}
	if strings.TrimSpace(otros) != "" {
		links = append(links, otros)
	}

	return links
}

// GET /protected/perfil-empleador (por ejemplo)
func GetEmployerProfileHandler(c *gin.Context, db *sql.DB) {
	userId, err := getUserIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
		return
	}

	var (
		nombre, apellido, email, telefono, ciudad string
		biografia, fotoPerfil, tipoIdentidad      string
		whatsapp, linkedin, facebookIG, otrosLinks string
		razonSocial, cedulaRuc, areaActividad     string
	)

	err = db.QueryRow(`
		SELECT
			nombre,
			apellido,
			email,
			telefono,
			ciudad,
			biografia,
			foto_perfil,
			tipo_identidad,
			whatsapp,
			linkedin,
			facebook_ig,
			otros_links,
			razon_social,
			cedula_ruc,
			area_actividad_principal
		FROM empleadores
		WHERE id = $1
	`, userId).Scan(
		&nombre,
		&apellido,
		&email,
		&telefono,
		&ciudad,
		&biografia,
		&fotoPerfil,
		&tipoIdentidad,
		&whatsapp,
		&linkedin,
		&facebookIG,
		&otrosLinks,
		&razonSocial,
		&cedulaRuc,
		&areaActividad,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"message": "Empleador no encontrado"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error al obtener el perfil de empleador"})
		return
	}

	links := buildEmployerLinks(whatsapp, linkedin, facebookIG, otrosLinks)

	// Misma estructura que ya estabas usando en el front, solo corregido:
	// biografia va en "biografia", y "links" solo es el array de contactos.
	c.JSON(http.StatusOK, gin.H{
		"nombre":                   nombre,
		"apellido":                 apellido,
		"empresa":                  razonSocial,
		"ruc":                      cedulaRuc,
		"cedula":                   "",
		"email":                    email,
		"telefono":                 telefono,
		"ciudad":                   ciudad,
		"sector_laboral":           []string{areaActividad},
		"biografia":                biografia,
		"links":                    links,
		"fecha_nacimiento":         "",
		"preferencias_categorias":  "",
		"frase_corta":              "",
		"foto_perfil":              fotoPerfil,
		"whatsapp":                 whatsapp,
		"linkedin":                 linkedin,
		"facebook_ig":              facebookIG,
		"tipo_identidad":           tipoIdentidad,
		"total_estudiantes_contratados": 0,
		"rating_promedio":              0,
		"total_trabajos_publicados":    0,
	})
}

// ==================== EMPLEADOR: UPDATE PERFIL ====================
func UpdateEmployerProfileHandler(c *gin.Context, db *sql.DB) {
	userId, err := getUserIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
		return
	}

	var input EmployerProfileUpdateRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Error al procesar los datos",
			"details": err.Error(),
		})
		return
	}

	tipo := strings.ToLower(strings.TrimSpace(input.TipoIdentidad))
	if tipo != "persona" && tipo != "empresa" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "tipo_identidad inválido"})
		return
	}

	// ====================================================================
	//            GUARDAR FOTO PERFIL COMO ARCHIVO (NO BASE64)
	// ====================================================================
	fotoPerfilURL := ""
	if strings.TrimSpace(input.FotoPerfilBase64) != "" {

		raw := input.FotoPerfilBase64
		if idx := strings.Index(raw, ","); idx != -1 {
			raw = raw[idx+1:]
		}

		data, err := base64.StdEncoding.DecodeString(raw)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "foto_perfil_base64 inválido"})
			return
		}

		os.MkdirAll("./uploads", 0755)

		filename := filepath.Join("./uploads", "perfil_"+strconv.Itoa(userId)+".png")

		if err := os.WriteFile(filename, data, 0644); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Error guardando foto de perfil"})
			return
		}

		fotoPerfilURL = "http://" + c.Request.Host + "/uploads/" + "perfil_" + strconv.Itoa(userId) + ".png"
	}

	// ====================================================================
	//            GUARDAR LOGO EMPRESA COMO ARCHIVO (NO BASE64)
	// ====================================================================
	logoEmpresaURL := ""
	if strings.TrimSpace(input.LogoEmpresaBase64) != "" {

		raw := input.LogoEmpresaBase64
		if idx := strings.Index(raw, ","); idx != -1 {
			raw = raw[idx+1:]
		}

		data, err := base64.StdEncoding.DecodeString(raw)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "logo_empresa_base64 inválido"})
			return
		}

		os.MkdirAll("./uploads", 0755)

		filename := filepath.Join("./uploads", "logo_"+strconv.Itoa(userId)+".png")

		if err := os.WriteFile(filename, data, 0644); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Error guardando logo de empresa"})
			return
		}

		logoEmpresaURL = "http://" + c.Request.Host + "/uploads/" + "logo_" + strconv.Itoa(userId) + ".png"
	}

	// ====================================================================
	//                 PERFIL COMPLETO SEGÚN EL TIPO
	// ====================================================================
	profileCompletePersona := fotoPerfilURL != "" && input.Biografia != ""

	profileCompleteEmpresa := fotoPerfilURL != "" &&
		logoEmpresaURL != "" &&
		input.Biografia != "" &&
		input.DominioCorporativo != "" &&
		input.RazonSocial != "" &&
		input.AreaActividadPrincipal != "" &&
		input.DescripcionEmpresa != ""

	// ====================================================================
	//                 UPDATE SEGÚN TIPO PERSONA / EMPRESA
	// ====================================================================
	var updateQuery string
	var args []interface{}

	if tipo == "persona" {
		updateQuery = `
			UPDATE empleadores SET
				foto_perfil = $1,
				logo_empresa = $2,
				biografia = $3,
				whatsapp = $4,
				linkedin = $5,
				facebook_ig = $6,
				otros_links = $7,
				perfil_completo = $8,
				tipo_identidad = $9
			WHERE id = $10
		`

		args = []interface{}{
			fotoPerfilURL,
			logoEmpresaURL,
			input.Biografia,
			input.Whatsapp,
			input.Linkedin,
			input.FacebookIG,
			input.OtrosLinks,
			profileCompletePersona,
			tipo,   // 👈 aquí guardas "persona"
			userId, // WHERE id = $10
		}

	} else { // EMPRESA
		updateQuery = `
			UPDATE empleadores SET
				foto_perfil = $1,
				logo_empresa = $2,
				biografia = $3,
				whatsapp = $4,
				linkedin = $5,
				facebook_ig = $6,
				otros_links = $7,
				dominio_corporativo = $8,
				razon_social = $9,
				area_actividad_principal = $10,
				descripcion_empresa = $11,
				perfil_completo = $12,
				tipo_identidad = $13
			WHERE id = $14
		`

		args = []interface{}{
			fotoPerfilURL,
			logoEmpresaURL,
			input.Biografia,
			input.Whatsapp,
			input.Linkedin,
			input.FacebookIG,
			input.OtrosLinks,
			input.DominioCorporativo,
			input.RazonSocial,
			input.AreaActividadPrincipal,
			input.DescripcionEmpresa,
			profileCompleteEmpresa,
			tipo,   // 👈 aquí guardas "empresa"
			userId, // WHERE id = $14
		}
	}
	_, err = db.Exec(updateQuery, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error al actualizar el perfil de empleador"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":        "Perfil de empleador actualizado correctamente",
		"tipo_identidad": tipo,
		"foto_perfil":    fotoPerfilURL,
		"logo_empresa":   logoEmpresaURL,
	})
}