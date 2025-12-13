package estud

import (
	"database/sql"
	"encoding/base64"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type EditEstudianteRequest struct {
	Biografia        *string   `json:"biografia"`
	Habilidades      *[]string `json:"habilidades"`
	Disponibilidad   *string   `json:"disponibilidad"`
	Enlaces          *string   `json:"enlaces"`
	FotoPerfilBase64 *string   `json:"fotoPerfilBase64"`
}

func EditarPerfilEstudiante(db *sql.DB, ctx *gin.Context) {

	userID, err := getUserIdFromJWT(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "token inválido"})
		return
	}

	var req EditEstudianteRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "json inválido"})
		return
	}

	query := "UPDATE estudiantes SET "
	args := []interface{}{}
	i := 1

	// BIOGRAFIA
	if req.Biografia != nil {
		query += fmt.Sprintf("biografia=$%d,", i)
		args = append(args, *req.Biografia)
		i++
	}

	// HABILIDADES como TEXT[]
	if req.Habilidades != nil {

		// Convertimos []string → {A,B,C}
		formatted := "{" + strings.Join(*req.Habilidades, ",") + "}"

		query += fmt.Sprintf("habilidades_basicas=$%d::text[],", i)
		args = append(args, formatted)
		i++
	}

	// DISPONIBILIDAD
	if req.Disponibilidad != nil {
		query += fmt.Sprintf("disponibilidad_de_tiempo=$%d,", i)
		args = append(args, *req.Disponibilidad)
		i++
	}

	// LINKS
	if req.Enlaces != nil {
		query += fmt.Sprintf("links=$%d,", i)
		args = append(args, *req.Enlaces)
		i++
	}

	// FOTO BASE64
	if req.FotoPerfilBase64 != nil && *req.FotoPerfilBase64 != "" {

		data, err := base64.StdEncoding.DecodeString(*req.FotoPerfilBase64)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "foto base64 inválida"})
			return
		}

		filename := fmt.Sprintf("uploads/foto_%d_%d.jpg", userID, time.Now().Unix())

		if err := os.WriteFile(filename, data, 0644); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "no se pudo guardar la foto"})
			return
		}

		fotoURL := "https://" + ctx.Request.Host + "/" + filename

		query += fmt.Sprintf("foto_perfil=$%d,", i)
		args = append(args, fotoURL)
		i++
	}

	if len(args) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "no se envió ningún campo para actualizar"})
		return
	}

	query = query[:len(query)-1] // Quitamos coma final
	query += fmt.Sprintf(" WHERE id=$%d", i)
	args = append(args, userID)

	_, err = db.Exec(query, args...)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "no se pudo actualizar el perfil",
			"err":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "perfil actualizado"})
}