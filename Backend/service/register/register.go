package registro

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"github.com/golang-jwt/jwt/v5"
)

// Estructura de los datos de registro
type RegisterUser struct {
	Nombre           string `json:"nombre"`
	Apellido         string `json:"apellido"`
	Email            string `json:"email"`
	Password         string `json:"password"`
	TipoCuenta       string `json:"tipo_cuenta"`
	CedulaRuc        string `json:"cedula_ruc"` // para empleadores
	Cedula           string `json:"cedula"`     // para estudiantes
	Telefono         string `json:"telefono"`
	FechaNacimiento  string `json:"fecha_nacimiento"`
	Ciudad           string `json:"ciudad"`
	Direccion        string `json:"direccion"`
	Edad             int    `json:"edad"`
	Institucion      string `json:"institucion_educativa"` // para estudiantes
	Carrera          string `json:"carrera"`              // para estudiantes
	Universidad      string `json:"universidad"`          // para estudiantes
	Disponibilidad   bool   `json:"disponibilidad_de_tiempo"` // para estudiantes
	FotoPerfil       string `json:"foto_perfil"`            // Para empleadores
	FotoDeCarnet     string `json:"foto_de_carnet"`         // Para estudiantes
}

// Función para manejar el registro de un usuario
func RegisterHandler(c *gin.Context, db *sql.DB) {
	var input RegisterUser
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Datos incompletos",
			"err":     err,
		})
		return
	}

	// Validar que el email termina con "edu.ec" si es un estudiante
	if input.TipoCuenta == "estudiante" && !isValidEmail(input.Email) {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "El email debe ser de la forma usuario@edu.ec",
		})
		return
	}

	// Cifrar la contraseña
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error al cifrar la contraseña",
		})
		return
	}

	// Registrar al usuario dependiendo del tipo de cuenta
	if input.TipoCuenta == "empleador" {
		err = registerEmpleador(db, input, hashedPassword)
	} else if input.TipoCuenta == "estudiante" {
		err = registerEstudiante(db, input, hashedPassword)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Tipo de cuenta no válido",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error al registrar el usuario",
		})
		return
	}

	// Generar el token de verificación
	verificationToken, err := generateVerificationToken(input.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error al generar el token de verificación",
		})
		return
	}

	// Enviar el correo de verificación
	err = sendVerificationEmail(input.Email, verificationToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error al enviar el correo de verificación",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Usuario registrado correctamente. Verifica tu correo electrónico.",
	})
}

// Validar que el email sea de la forma usuario@edu.ec
func isValidEmail(email string) bool {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@edu\.ec$`)
	return re.MatchString(email)
}

// Función para generar un token JWT para verificación de email
func generateVerificationToken(email string) (string, error) {
	claims := jwt.MapClaims{
		"email": email,
		"exp":   time.Now().Add(24 * time.Hour).Unix(), // Token válido por 24 horas
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte("tu_clave_secreta"))
}

// Función para enviar el correo con el enlace de verificación
func sendVerificationEmail(email string, verificationToken string) error {
	// Cambia la URL para usar tu dominio real
	domain := "https://tu-dominio.com" // Reemplaza con tu dominio real
	verificationURL := fmt.Sprintf("%s/verify?token=%s", domain, verificationToken)

	// Configuración del servidor SMTP (usando Gmail en este caso)
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"
	from := "tu_email@gmail.com"
	password := "tu_contraseña"

	// Crear el cuerpo del correo
	subject := "Verificación de cuenta"
	body := fmt.Sprintf(`
		Hola,
		Por favor, haz clic en el siguiente enlace para verificar tu cuenta:
		%s

		Este enlace expirará en 24 horas.
	`, verificationURL)

	message := []byte("Subject: " + subject + "\r\n" + body)

	// Autenticación SMTP
	auth := smtp.PlainAuth("", from, password, smtpHost)

	// Enviar el correo
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{email}, message)
	return err
}

// Función para registrar un empleador
func registerEmpleador(db *sql.DB, input RegisterUser, hashedPassword []byte) error {
	query := `
		INSERT INTO empleadores (nombre, apellido, email, password, tipo_cuenta, cedula_ruc, telefono, fecha_nacimiento, ciudad, foto_perfil, direccion, edad, email_verificado)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, FALSE)
	`

	_, err := db.Exec(query, input.Nombre, input.Apellido, input.Email, hashedPassword, input.TipoCuenta, input.CedulaRuc, input.Telefono, input.FechaNacimiento, input.Ciudad, input.FotoPerfil, input.Direccion, input.Edad)
	if err != nil {
		log.Println("Error al registrar el empleador:", err)
		return err
	}
	return nil
}

// Función para registrar un estudiante
func registerEstudiante(db *sql.DB, input RegisterUser, hashedPassword []byte) error {
	query := `
		INSERT INTO estudiantes (nombre, apellido, email, password, tipo_cuenta, cedula, telefono, institucion_educativa, fecha_nacimiento, direccion, edad, ciudad, carrera, nivel_actual, foto_de_carnet, universidad, disponibilidad_de_tiempo, email_verificado)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, FALSE)
	`

	_, err := db.Exec(query, input.Nombre, input.Apellido, input.Email, hashedPassword, input.TipoCuenta, input.Cedula, input.Telefono, input.Institucion, input.FechaNacimiento, input.Direccion, input.Edad, input.Ciudad, input.Carrera, "N/A", input.FotoDeCarnet, input.Universidad, input.Disponibilidad)
	if err != nil {
		log.Println("Error al registrar el estudiante:", err)
		return err
	}
	return nil
}
