package jobsemp

import (
	"database/sql"
	"net/http"
	"github.com/gin-gonic/gin"
)

type DeleteJobRequest struct {
	ID int `json:"id"`
}

func DeleteJob(db *sql.DB, c *gin.Context) {
	// Validar token con tu función
	userID, err := getEmployerIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Token inválido",
		})
		return
	}

	// Leer el JSON del body
	var req DeleteJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "JSON inválido",
		})
		return
	}

	if req.ID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID inválido",
		})
		return
	}

	// Verificar que el job exista, sea del usuario y esté abierto
	var estado string
	var ownerID int

	err = db.QueryRow(
		"SELECT estado, empleador_id FROM jobs WHERE id = $1",
		req.ID,
	).Scan(&estado, &ownerID)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Trabajo no encontrado",
		})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error al verificar trabajo",
		})
		return
	}

	// Verificar que el trabajo pertenezca al usuario del token
	if ownerID != userID {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "No puedes borrar este trabajo",
		})
		return
	}

	// Verificar que esté abierto
	if estado != "abierto" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Solo se pueden borrar trabajos con estado 'abierto'",
		})
		return
	}

	// Borrar el trabajo
	_, err = db.Exec("DELETE FROM jobs WHERE id = $1 AND estado = 'abierto'", req.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error al borrar el trabajo",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Trabajo eliminado correctamente",
		"id":      req.ID,
	})
}


