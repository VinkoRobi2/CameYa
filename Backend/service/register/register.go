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

type RegisterUser struct {
	Nombre              string  `json:"nombre"`
	Apellido            string  `json:"apellido"`
	Email               string  `json:"email"`
	Password            string  `json:"password"`
	TipoCuenta          string  `json:"tipo_cuenta"`
	CedulaRuc           string  `json:"cedula_ruc"`
	Cedula              string  `json:"cedula"`
	Telefono            string  `json:"telefono"`
	FechaNacimiento     string  `json:"fecha_nacimiento"`
	Ciudad              string  `json:"ciudad"`
	Ubicacion           string  `json:"ubicacion"`
	Edad                int     `json:"edad"`
	Institucion         string  `json:"institucion_educativa"`
	Carrera             string  `json:"carrera"`
	Universidad         string  `json:"universidad"`
	DisponibilidadTexto string  `json:"disponibilidad_de_tiempo"`
	FotoPerfil          string  `json:"foto_perfil"`
	FotoDeCarnet        string  `json:"foto_de_carnet"`
	NivelActual         string  `json:"nivel_actual"`
	TerminosAceptados   *bool   `json:"terminos_aceptados"`

	// Solo para empleadores (pueden ser NULL en DB)
	TipoIdentidad          *string `json:"tipo_identidad"`
	PreferenciasCategorias *string `json:"preferencias_categorias"`
	DominioCorporativo     *string `json:"dominio_corporativo"`
	RazonSocial            *string `json:"razon_social"`
}

func RegisterHandler(c *gin.Context, db *sql.DB) {
	var input RegisterUser
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Datos incompletos", "err": err.Error()})
		return
	}

	if input.TipoCuenta == "estudiante" && !isValidEduEmail(input.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"message": "El email debe ser de la forma usuario@edu.ec"})
		return
	}
	if input.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Password requerido"})
		return
	}
	if input.TipoCuenta == "estudiante" && input.FotoDeCarnet == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "foto_de_carnet es obligatoria"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error al cifrar la contraseña"})
		return
	}

	switch input.TipoCuenta {
	case "empleador":
		if err := registerEmpleador(db, input, hashedPassword); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Error al registrar el empleador"})
			return
		}
	case "estudiante":
		if err := registerEstudiante(db, input, hashedPassword); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Error al registrar el estudiante"})
			return
		}
	default:
		c.JSON(http.StatusBadRequest, gin.H{"message": "Tipo de cuenta no válido"})
		return
	}

	verificationToken, err := generateVerificationToken(input.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error al generar el token de verificación"})
		return
	}
	if err := sendVerificationEmail(input.Email, verificationToken); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error al enviar el correo de verificación", "err": err})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usuario registrado correctamente. Verifica tu correo electrónico."})
}

func isValidEduEmail(email string) bool {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)*edu\.ec$`)
	return re.MatchString(email)
}

func generateVerificationToken(email string) (string, error) {
	claims := jwt.MapClaims{
		"email": email,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte("tu_clave_secreta"))
}

func sendVerificationEmail(email string, verificationToken string) error {
	domain := "https://cameya.pages.dev"
	verificationURL := fmt.Sprintf("%s/verify?token=%s", domain, verificationToken)
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"
	from := "vinkolino178@gmail.com"
	password := "crhn tifm kyve ffje"

	subject := "Verificación de cuenta"
	body := fmt.Sprintf(`
Hola,
Por favor, haz clic en el siguiente enlace para verificar tu cuenta:
%s

Este enlace expirará en 24 horas.
`, verificationURL)
	message := []byte("Subject: " + subject + "\r\n" + body)
	auth := smtp.PlainAuth("", from, password, smtpHost)
	return smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{email}, message)
}

// === Empleadores: actualizado para tu DB (incluye columnas nuevas, NULL permitidos) ===
func registerEmpleador(db *sql.DB, input RegisterUser, hashedPassword []byte) error {
	query := `
		INSERT INTO empleadores (
			nombre, apellido, email, password, tipo_cuenta,
			cedula_ruc, telefono, fecha_nacimiento, ciudad, foto_perfil,
			ubicacion, edad,
			tipo_identidad, preferencias_categorias, dominio_corporativo, razon_social,
			email_verificado
		) VALUES (
			$1,  $2,  $3,  $4,  $5,
			$6,  $7,  $8,  $9,  $10,
			$11, $12,
			$13, $14, $15, $16,
			FALSE
		)
	`
	_, err := db.Exec(
		query,
		input.Nombre,                 // 1
		input.Apellido,               // 2
		input.Email,                  // 3
		hashedPassword,               // 4
		input.TipoCuenta,             // 5
		input.CedulaRuc,              // 6
		input.Telefono,               // 7
		input.FechaNacimiento,        // 8
		input.Ciudad,                 // 9
		input.FotoPerfil,             // 10
		input.Ubicacion,              // 11
		input.Edad,                   // 12
		input.TipoIdentidad,          // 13 (NULL si no se envía)
		input.PreferenciasCategorias, // 14 (NULL si no se envía)
		input.DominioCorporativo,     // 15 (NULL si no se envía)
		input.RazonSocial,            // 16 (NULL si no se envía)
	)
	if err != nil {
		log.Println("Error al registrar el empleador:", err)
		return err
	}
	return nil
}

// === Estudiantes: lo dejas igual ===
func registerEstudiante(db *sql.DB, input RegisterUser, hashedPassword []byte) error {
	ta := true
	if input.TerminosAceptados != nil {
		ta = *input.TerminosAceptados
	}

	query := `
		INSERT INTO estudiantes (
			nombre, apellido, email, password, tipo_cuenta,
			cedula, telefono, institucion_educativa, fecha_nacimiento, ubicacion,
			edad, ciudad, carrera, nivel_actual, foto_de_carnet,
			universidad, disponibilidad_de_tiempo, terminos_aceptados, email_verificado
		) VALUES (
			$1, $2, $3, $4, $5,
			$6, $7, $8, $9, $10,
			$11, $12, $13, $14, $15,
			$16, $17, $18, FALSE
		)
	`
	_, err := db.Exec(
		query,
		input.Nombre,              // 1
		input.Apellido,            // 2
		input.Email,               // 3
		hashedPassword,            // 4
		input.TipoCuenta,          // 5
		input.Cedula,              // 6
		input.Telefono,            // 7
		input.Institucion,         // 8
		input.FechaNacimiento,     // 9
		input.Ubicacion,           // 10
		input.Edad,                // 11
		input.Ciudad,              // 12
		input.Carrera,             // 13
		input.NivelActual,         // 14
		input.FotoDeCarnet,        // 15
		input.Universidad,         // 16
		input.DisponibilidadTexto, // 17
		ta,                        // 18
	)
	if err != nil {
		log.Println("Error al registrar el estudiante:", err)
		return err
	}
	return nil
}
