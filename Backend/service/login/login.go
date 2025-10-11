package service

import (
	"database/sql"
	"errors"
	"net/http"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	// Importa el paquete auth
	auth "github.com/VinkoRobi2/FlashWorkEC/service"
)

// Estructura para recibir los datos de login
type Loginstruct struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Función para manejar el login y devolver el token JWT
func LoginHandler(c *gin.Context, db *sql.DB) {
	var input Loginstruct
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Email y contrasena requeridos",
			"err":     err,
		})
		return
	}

	// Verificar las credenciales en la base de datos
	user, err := getUserByEmail(input.Email, db)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Credenciales inválidas",
		})
		return
	}

	// Verificar la contraseña
	if !checkPasswordHash(input.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Credenciales inválidas",
		})
		return
	}

	// Crear un JWT
	// Asegúrate de pasar los tres parámetros: user.UserID, user.Email y user.Role
	token, err := auth.GenerateToken(user.UserID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error al generar el token",
		})
		return
	}

	// Responder con los datos del usuario (nombre, foto de perfil, tipo de cuenta) y el JWT
	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user_data": gin.H{
			"nombre":      user.Nombre,
			"foto_perfil": user.FotoPerfil,
			"tipo_cuenta": user.Role, // tipo_cuenta es el rol del usuario (empleador o estudiante)
		},
	})
}

// Función para obtener un usuario por email
func getUserByEmail(email string, db *sql.DB) (*User, error) {
	var user User
	// Primero se verifica en la tabla de empleadores
	query := `SELECT user_id, email, password, nombre, foto_perfil, tipo_cuenta FROM empleadores WHERE email = $1`
	err := db.QueryRow(query, email).Scan(&user.UserID, &user.Email, &user.Password, &user.Nombre, &user.FotoPerfil, &user.Role)
	if err == nil {
		return &user, nil
	}
	// Si no se encuentra, se verifica en la tabla de estudiantes
	query = `SELECT user_id, email, password, nombre, foto_de_carnet, tipo_cuenta FROM estudiantes WHERE email = $1`
	err = db.QueryRow(query, email).Scan(&user.UserID, &user.Email, &user.Password, &user.Nombre, &user.FotoPerfil, &user.Role)
	if err == nil {
		user.FotoPerfil = user.FotoPerfil // Foto de perfil en estudiantes puede estar en foto_de_carnet
		return &user, nil
	}

	return nil, errors.New("usuario no encontrado")
}

// Función para comprobar la contraseña hasheada
func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

type User struct {
	UserID    int    `json:"user_id"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Nombre    string `json:"nombre"`
	FotoPerfil string `json:"foto_perfil"`
	Role      string `json:"role"`
}
