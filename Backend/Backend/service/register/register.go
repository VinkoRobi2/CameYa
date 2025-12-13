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
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Claims del token
type EmailVerificationClaims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

// Struct limpio (SIN tipo_identidad)
type RegisterUser struct {
	Nombre              string  `json:"nombre"`
	Apellido            string  `json:"apellido"`
	Email               string  `json:"email"`
	Password            string  `json:"password"`
	TipoCuenta          string  `json:"tipo_cuenta"`
	Telefono            string  `json:"telefono"`
	Ciudad              string  `json:"ciudad"`
	FotoPerfil          string  `json:"foto_perfil"`
	Carrera             string  `json:"carrera"`
	Universidad         string  `json:"universidad"`
	DisponibilidadTexto string  `json:"disponibilidad_de_tiempo"`
	TerminosAceptados   *bool   `json:"terminos_aceptados"`

	// Empleador (limpio)
	DominioCorp *string `json:"dominio_corporativo"`
	RazonSocial *string `json:"razon_social"`
}

func RegisterHandler(c *gin.Context, db *sql.DB) {
	var input RegisterUser
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Datos incompletos o inválidos",
			"err":     err.Error(),
		})
		return
	}

	// Validar tipo de cuenta
	if input.TipoCuenta != "estudiante" && input.TipoCuenta != "empleador" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Tipo de cuenta inválido"})
		return
	}

	// Validación de términos
	if input.TerminosAceptados == nil || !*input.TerminosAceptados {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Debes aceptar los términos y condiciones."})
		return
	}

	// Validación email edu.ec solo para estudiantes
	if input.TipoCuenta == "estudiante" && !isValidEduEmail(input.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Email debe terminar en @edu.ec"})
		return
	}

	// Validar password
	if input.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Password requerido"})
		return
	}

	// Hashear password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error al cifrar contraseña"})
		return
	}

	// Registro según tipo
	switch input.TipoCuenta {
	case "empleador":
		if err := registerEmpleador(db, input, hashedPassword); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Error al registrar empleador",
				"err":     err.Error(),
			})
			return
		}
	case "estudiante":
		if err := registerEstudiante(db, input, hashedPassword); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Error al registrar estudiante",
				"err":     err.Error(),
			})
			return
		}
	}

	// Token verificación
	verificationToken, err := generateVerificationToken(input.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error al generar token de verificación"})
		return
	}

	// Enviar verificación async
	go func(email, token string) {
		if err := sendVerificationEmail(email, token); err != nil {
			log.Println("Error enviando correo de verificación:", err)
		}
	}(input.Email, verificationToken)

	c.JSON(http.StatusOK, gin.H{
		"message": "Usuario registrado. Revisa tu correo para verificar tu cuenta.",
	})
}

// ======================== UTILIDADES ========================

func isValidEduEmail(email string) bool {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)*edu\.ec$`)
	return re.MatchString(email)
}

func generateVerificationToken(email string) (string, error) {
	claims := EmailVerificationClaims{
		Email: email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte("supersecretkey"))
}

func sendVerificationEmail(email, token string) error {
	domain := "https://cameya.pages.dev"
	url := fmt.Sprintf("%s/verify?token=%s", domain, token)

	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	from := "admin@cameyaapp.com"
	password := "pqyh dcze ufrr cgdt"

	subject := "Verificación de cuenta"
	body := fmt.Sprintf("Hola,\n\nVerifica tu cuenta aquí:\n%s\n\nSi no creaste esta cuenta, ignora este correo.", url)
	msg := []byte("Subject: " + subject + "\r\n\r\n" + body)

	auth := smtp.PlainAuth("", from, password, smtpHost)
	return smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{email}, msg)
}

// ======================== REGISTROS BD ========================

// EMPLEADORES (SIN tipo_identidad)
func registerEmpleador(db *sql.DB, input RegisterUser, hashedPassword []byte) error {
	query := `
		INSERT INTO empleadores (
			nombre, apellido, email, password, tipo_cuenta,
			telefono, ciudad, foto_perfil,
			dominio_corporativo, razon_social,
			email_verificado, consentimiento, perfil_completo
		) VALUES (
			$1,$2,$3,$4,'empleador',
			$5,$6,$7,
			$8,$9,
			FALSE,TRUE,FALSE
		)
	`

	_, err := db.Exec(
		query,
		input.Nombre,
		input.Apellido,
		input.Email,
		hashedPassword,

		input.Telefono,
		input.Ciudad,
		input.FotoPerfil,

		input.DominioCorp,
		input.RazonSocial,
	)

	if err != nil {
		log.Println("Error registrando empleador:", err)
		return err
	}

	return nil
}

// ESTUDIANTES
func registerEstudiante(db *sql.DB, input RegisterUser, hashedPassword []byte) error {
	ta := true
	if input.TerminosAceptados != nil {
		ta = *input.TerminosAceptados
	}

	query := `
		INSERT INTO estudiantes (
			nombre, apellido, email, password, tipo_cuenta,
			telefono, ciudad, carrera, universidad,
			disponibilidad_de_tiempo, foto_perfil,
			consentimiento, email_verificado, perfil_completo
		) VALUES (
			$1,$2,$3,$4,'estudiante',
			$5,$6,$7,$8,
			$9,$10,
			$11,FALSE,FALSE
		)
	`

	_, err := db.Exec(
		query,
		input.Nombre,
		input.Apellido,
		input.Email,
		hashedPassword,

		input.Telefono,
		input.Ciudad,
		input.Carrera,
		input.Universidad,

		input.DisponibilidadTexto,
		input.FotoPerfil,
		ta,
	)

	if err != nil {
		log.Println("Error registrando estudiante:", err)
		return err
	}

	return nil
}