package jobsemp

import (
	"database/sql"
	"net/http"


	"github.com/gin-gonic/gin"
)

type EditJobRequest struct {
	Titulo      *string  `json:"titulo"`
	Descripcion *string  `json:"descripcion"`
	Categoria   *string  `json:"categoria"`
	Ubicacion   *string  `json:"ubicacion"`
	Pago        *float64 `json:"pago_estimado"`
	Negociable  *bool    `json:"negociable"`
	Requisitos  *string  `json:"requisitos"`
	Habilidades *string  `json:"habilidades"`
	ID          int      `json:"id"`
}

func EditJob(db *sql.DB, c *gin.Context) {
	// Validar token
	userID, err := getEmployerIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	// Leer JSON
	var req EditJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JSON inválido"})
		return
	}

	if req.ID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	// Cargar valores actuales
	var titulo, descripcion, categoria, ubicacion, requisitos, habilidades string
	var pago float64
	var negociable bool
	var ownerID int
	var estado string

	err = db.QueryRow(`
        SELECT titulo, descripcion, categoria, ubicacion, pago_estimado, negociable, requisitos, habilidades, empleador_id, estado
        FROM jobs WHERE id = $1
    `, req.ID).Scan(
		&titulo, &descripcion, &categoria, &ubicacion, &pago,
		&negociable, &requisitos, &habilidades, &ownerID, &estado,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trabajo no encontrado"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al leer trabajo"})
		return
	}

	// Verificar dueño
	if ownerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "No puedes editar este trabajo"})
		return
	}

	// Solo se puede editar si está abierto
	if estado != "abierto" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo se pueden editar trabajos con estado 'abierto'"})
		return
	}

	// Reemplazar solo campos presentes en el JSON
	if req.Titulo != nil {
		titulo = *req.Titulo
	}
	if req.Descripcion != nil {
		descripcion = *req.Descripcion
	}
	if req.Categoria != nil {
		categoria = *req.Categoria
	}
	if req.Ubicacion != nil {
		ubicacion = *req.Ubicacion
	}
	if req.Pago != nil {
		pago = *req.Pago
	}
	if req.Negociable != nil {
		negociable = *req.Negociable
	}
	if req.Requisitos != nil {
		requisitos = *req.Requisitos
	}
	if req.Habilidades != nil {
		habilidades = *req.Habilidades
	}

	// Actualizar en BD
	_, err = db.Exec(`
        UPDATE jobs SET
            titulo = $1,
            descripcion = $2,
            categoria = $3,
            ubicacion = $4,
            pago_estimado = $5,
            negociable = $6,
            requisitos = $7,
            habilidades = $8,
            actualizado_en = NOW()
        WHERE id = $9
    `, titulo, descripcion, categoria, ubicacion, pago,
		negociable, requisitos, habilidades, req.ID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar trabajo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Trabajo actualizado exitosamente",
		"id":      req.ID,
	})
}
