package verify

import (

	"database/sql"

	"fmt"
	"net/http"
	"net/smtp"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const verificationTTL = 15 * time.Minute

// -----------------------------
// CLAIMS PARA EL JWT
// -----------------------------


// -----------------------------
// REQUEST DEL BODY
// -----------------------------
type resendRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// -----------------------------
// RESEND VERIFICATION HANDLER
// -----------------------------
func ResendVerification(c *gin.Context, db *sql.DB) {
	var req resendRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email inválido o faltante"})
		return
	}

	email := req.Email
	var (
		id              int64
		emailVerificado bool
	)

	// Verificar si existe el empleador
	err := db.QueryRowContext(
		c.Request.Context(),
		`SELECT id, email_verificado FROM empleadores WHERE email = $1`,
		email,
	).Scan(&id, &emailVerificado)

	if err == sql.ErrNoRows {
		// No revelamos si existe o no
		c.JSON(http.StatusOK, gin.H{"message": "Si el correo existe, se ha enviado un nuevo enlace de verificación."})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al consultar el empleador"})
		return
	}
	if emailVerificado {
		c.JSON(http.StatusBadRequest, gin.H{"error": "La cuenta ya está verificada"})
		return
	}

	// ---------------------------------------
	// GENERAR JWT DE VERIFICACIÓN (nuevo)
	// ---------------------------------------
	token, err := generateVerificationToken(email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo generar el token de verificación"})
		return
	}

	// Enviar correo
	if err := sendVerificationEmail(email, token); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo enviar el correo de verificación"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Se ha enviado un nuevo correo de verificación."})
}

// -----------------------------
// GENERAR TOKEN JWT
// -----------------------------
func generateVerificationToken(email string) (string, error) {
	claims := EmailVerificationClaims{
		Email: email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(verificationTTL)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte("supersecretkey"))
}

// -----------------------------
// ENVIAR EMAIL
// -----------------------------
func sendVerificationEmail(email string, verificationToken string) error {
	domain := "https://cameya.pages.dev"
	verificationURL := fmt.Sprintf("%s/verify?token=%s", domain, verificationToken)

	smtpHost := "smtp.gmail.com"
	smtpPort := "587"
	from := "admin@cameyaapp.com"
	password := "pqyh dcze ufrr cgdt"

	subject := "Verificación de cuenta"
	body := fmt.Sprintf(`Hola,

Por favor, haz clic en el siguiente enlace para verificar tu cuenta:
%s

Este enlace expirará en %d minutos.
`, verificationURL, int(verificationTTL.Minutes()))

	message := []byte("Subject: " + subject + "\r\n" +
		"From: " + from + "\r\n" +
		"To: " + email + "\r\n" +
		"Content-Type: text/plain; charset=\"UTF-8\"\r\n" +
		"\r\n" +
		body)

	auth := smtp.PlainAuth("", from, password, smtpHost)
	return smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{email}, message)
}