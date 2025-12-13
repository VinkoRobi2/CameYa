package jobsemp

import (
	"database/sql"
	"encoding/base64"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type CrearTrabajoRequest struct {
	Titulo       string `json:"titulo"`
	Descripcion  string `json:"descripcion"`
	Ubicacion    string `json:"ubicacion"`
	PagoEstimado int    `json:"pago_estimado"`
	Negociable   bool   `json:"negociable"`
	Requisitos   string `json:"requisitos"`
	Categoria    string `json:"categoria"`
	MetodoPago   string `json:"metodo_pago"`
	Presencial   bool   `json:"presencial"`
	// 👇 IMPORTANTE: mismo nombre que envías desde el frontend (foto_trabajo_base64)
	FotoBase64 string `json:"foto_trabajo_base64"`
}

func CrearTrabajoHandler(c *gin.Context, db *sql.DB) {

	userIDInterface, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}
	userID := userIDInterface.(int)

	var req CrearTrabajoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JSON inválido"})
		return
	}

	// Si no es presencial → ubicación vacía
	if !req.Presencial {
		req.Ubicacion = ""
	}

	// -------------------------------------
	// INSERTAR TRABAJO SIN FOTO
	// -------------------------------------
	query := `
		INSERT INTO jobs 
		(titulo, descripcion, ubicacion, pago_estimado, negociable, requisitos, categoria, metodo_pago, presencial, empleador_id, estado, creado_en, actualizado_en)
		VALUES 
		($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'abierto',NOW(),NOW())
		RETURNING id;
	`

	var trabajoID int
	err := db.QueryRow(query,
		req.Titulo,
		req.Descripcion,
		req.Ubicacion,
		req.PagoEstimado,
		req.Negociable,
		req.Requisitos,
		req.Categoria,
		req.MetodoPago,
		req.Presencial,
		userID,
	).Scan(&trabajoID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error al crear trabajo",
			"err":   err.Error(),
		})
		return
	}

	// -------------------------------------
	// SUBIR FOTO BASE64 SI EXISTE
	// -------------------------------------
	fotoURL := ""

	// El frontend está enviando algo tipo: "data:image/png;base64,AAAA..."
	raw := strings.TrimSpace(req.FotoBase64)
	if raw != "" {

		// Si viene con prefijo data:..., nos quedamos solo con la parte base64
		// para que DecodeString no falle.
		if idx := strings.Index(raw, ","); idx != -1 {
			raw = raw[idx+1:]
		}

		data, err := base64.StdEncoding.DecodeString(raw)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "foto_trabajo_base64 inválido"})
			return
		}

		// Crear carpeta uploads si no existe
		if err := os.MkdirAll("./uploads", 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo preparar el almacenamiento de imágenes"})
			return
		}

		// Nombre final del archivo
		filename := filepath.Join("./uploads", "job_"+strconv.Itoa(trabajoID)+".png")

		// Guardar imagen
		if err := os.WriteFile(filename, data, 0644); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error guardando imagen"})
			return
		}

		// URL pública de la foto
		fotoURL = "http://" + c.Request.Host + "/uploads/" + "job_" + strconv.Itoa(trabajoID) + ".png"

		// Actualizar job con la imagen
		if _, err := db.Exec(`UPDATE jobs SET foto_job = $1 WHERE id = $2`, fotoURL, trabajoID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error guardando foto en la BD"})
			return
		}
	}

	// -------------------------------------
	// RESPUESTA FINAL
	// -------------------------------------
	c.JSON(http.StatusCreated, gin.H{
		"mensaje":    "Trabajo creado exitosamente",
		"trabajo_id": trabajoID,
		"foto_job":   fotoURL,
	})
}