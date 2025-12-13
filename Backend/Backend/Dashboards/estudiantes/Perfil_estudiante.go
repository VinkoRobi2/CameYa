package estud

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

type Perfil_Estudiante struct {
	Nombre               string   `json:"nombre"`
	Apellido             string   `json:"apellido"`
	Titulo_perfil        string   `json:"titulo_perfil"`
	Bibiografia          string   `json:"bibiografia"`
	Links                []string `json:"links"`
	Cedula               string   `json:"cedula"`
	Email                string   `json:"email"`
	Telefono             string   `json:"telefono"`
	FechaNacimiento      string   `json:"fecha_nacimiento"`
	Ciudad               string   `json:"ciudad"`
	Carrera              string   `json:"carrera"`
	Universidad          string   `json:"universidad"`
	Email_verificado     bool     `json:"email_verificado"`
	Perfil_verificado    bool     `json:"perfil_verificado"`
	HabilidadesBasicas   []string `json:"habilidades_basicas"`
	FotoPerfil           string   `json:"foto_perfil"`
	DisponibilidadTiempo string   `json:"disponibilidad_de_tiempo"`
}

func Get_Estudiante_Info(c *gin.Context, db *sql.DB) {
	userId, err := getUserIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"err": err.Error()})
		return
	}

	query := `
		SELECT 
			nombre,
			apellido,
			biografia,
			links,
			email,
			telefono,
			ciudad,
			carrera,
			universidad,
			habilidades_basicas,
			foto_perfil,
			perfil_completo,
			email_verificado,
			disponibilidad_de_tiempo
		FROM estudiantes
		WHERE id = $1
	`

	var (
		linksStr       string
		habilidadesStr string
	)

	var perfil Perfil_Estudiante

	err = db.QueryRow(query, userId).Scan(
		&perfil.Nombre,
		&perfil.Apellido,
		&perfil.Bibiografia,
		&linksStr,
		&perfil.Email,
		&perfil.Telefono,
		&perfil.Ciudad,
		&perfil.Carrera,
		&perfil.Universidad,
		&habilidadesStr,
		&perfil.FotoPerfil,
		&perfil.Perfil_verificado,
		&perfil.Email_verificado,
		&perfil.DisponibilidadTiempo,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"err": "estudiante no encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"err": err.Error()})
		return
	}

	// Convertir CSV a slices
	if linksStr != "" {
		perfil.Links = strings.Split(linksStr, ",")
	} else {
		perfil.Links = []string{}
	}

	if habilidadesStr != "" {
		perfil.HabilidadesBasicas = strings.Split(habilidadesStr, ",")
	} else {
		perfil.HabilidadesBasicas = []string{}
	}

	c.JSON(http.StatusOK, perfil)
}