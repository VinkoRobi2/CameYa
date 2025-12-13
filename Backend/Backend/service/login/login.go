package service

import (
	"database/sql"
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	auth "github.com/VinkoRobi2/FlashWorkEC/service"
)

type Loginstruct struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type User struct {
	UserID         int            `json:"user_id"`
	Email          string         `json:"email"`
	Password       string         `json:"password"`
	Nombre         string         `json:"nombre"`
	FotoPerfil     string         `json:"foto_perfil"`
	PerfilCompleto bool           `json:"perfil_completo"`
	Role           string         `json:"role"`
	EmailVerified  bool           `json:"email_verificado"`
	TipoIdentidad  sql.NullString `json:"tipo_identidad"` // ← FIX
}

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func getUserByEmail(email string, db *sql.DB) (*User, error) {
	email = strings.TrimSpace(strings.ToLower(email))

	var u User

	// Buscar en empleadores (incluye tipo_identidad que puede ser NULL)
	q1 := `
SELECT id, email, password, nombre, foto_perfil, tipo_cuenta, email_verificado, tipo_identidad, perfil_completo
FROM empleadores
WHERE LOWER(email) = $1
LIMIT 1;
`
	err := db.QueryRow(q1, email).Scan(
		&u.UserID,
		&u.Email,
		&u.Password,
		&u.Nombre,
		&u.FotoPerfil,
		&u.Role,
		&u.EmailVerified,
		&u.TipoIdentidad,   // ← ahora soporta NULL
		&u.PerfilCompleto,
	)
	if err == nil {
		log.Println("Usuario encontrado en 'empleadores':", email)
		return &u, nil
	}
	if err != nil && err != sql.ErrNoRows {
		log.Println("Error al buscar en empleadores:", err)
	}

	// Buscar en estudiantes
	q2 := `
SELECT id, email, password, nombre, foto_perfil, tipo_cuenta, email_verificado, perfil_completo
FROM estudiantes
WHERE LOWER(email) = $1
LIMIT 1;
`
	err = db.QueryRow(q2, email).Scan(
		&u.UserID,
		&u.Email,
		&u.Password,
		&u.Nombre,
		&u.FotoPerfil,
		&u.Role,
		&u.EmailVerified,
		&u.PerfilCompleto,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("usuario no encontrado")
		}
		return nil, err
	}

	// Estudiantes no tienen tipo_identidad
	u.TipoIdentidad = sql.NullString{Valid: false}

	log.Println("Usuario encontrado en 'estudiantes':", email)
	return &u, nil
}

func LoginHandler(c *gin.Context, db *sql.DB) {
	var input Loginstruct

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Email y contraseña requeridos",
			"err":     err.Error(),
		})
		return
	}

	input.Email = strings.TrimSpace(strings.ToLower(input.Email))
	input.Password = strings.TrimSpace(input.Password)

	if input.Email == "" || input.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Email y contraseña requeridos"})
		return
	}

	user, err := getUserByEmail(input.Email, db)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Credenciales inválidas"})
		return
	}

	if !checkPasswordHash(input.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Credenciales inválidas"})
		return
	}

	if !user.EmailVerified {
		c.JSON(http.StatusForbidden, gin.H{
			"message": "Debes verificar tu correo electrónico para continuar.",
		})
		return
	}

	token, err := auth.GenerateToken(user.UserID, user.Email, user.Role)
	if err != nil {
		log.Printf("Error generando token para usuario %d", user.UserID)
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error al generar el token",
			"err":     err.Error(),
		})
		return
	}

	// Construir respuesta
	userData := gin.H{
		"nombre":           user.Nombre,
		"foto_perfil":      user.FotoPerfil,
		"tipo_cuenta":      user.Role,
		"user_id":          user.UserID,
		"email":            user.Email,
		"email_verificado": user.EmailVerified,
		"perfil_completo":  user.PerfilCompleto,
	}

	// Si es empleador → mandar tipo_identidad (vacío si NULL)
	if strings.ToLower(user.Role) == "empleador" {
		if user.TipoIdentidad.Valid {
			userData["tipo_identidad"] = user.TipoIdentidad.String
		} else {
			userData["tipo_identidad"] = ""
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"token":     token,
		"user_data": userData,
	})
}