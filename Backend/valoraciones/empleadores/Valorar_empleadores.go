package valemp

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"
	"strings"

	auth "github.com/VinkoRobi2/FlashWorkEC/service"
	"github.com/gin-gonic/gin"
)

type ValoracionEmpleador struct {
	EmpleadorValoradoID int  `json:"empleador_valorado_id" binding:"required"`
	JobID               int  `json:"job_id" binding:"required"`
	ClaridadTrabajo     bool `json:"claridad_trabajo"`
	RespetoTrato        bool `json:"respeto_trato"`
	PagoCumplimiento    bool `json:"pago_cumplimiento"`
	Organizacion        bool `json:"organizacion"`
	AmbienteSeguridad   bool `json:"ambiente_seguridad"`
	Rating              int  `json:"rating" binding:"required"` // 1–5
}

func getUserIdFromJWT(c *gin.Context) (int, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return 0, errors.New("authorization header faltante")
	}
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return 0, errors.New("formato de token inválido")
	}
	tokenStr := authHeader[7:]
	claims, err := auth.ValidateToken(tokenStr)
	if err != nil {
		return 0, errors.New("token inválido o expirado")
	}
	if claims.UserID == 0 {
		return 0, errors.New("user_id no encontrado en token")
	}
	return claims.UserID, nil
}

// Verificar que exista un match COMPLETADO entre estudiante y empleador
func hasCompletedMatchWithEmployer(db *sql.DB, studentID, empleadorID, jobID int) (bool, error) {
	var exists bool
	err := db.QueryRow(`
		SELECT EXISTS(
			SELECT 1
			FROM matches_job
			WHERE job_id = $1
			  AND estudiante_id = $2
			  AND empleador_id = $3
			  AND estado = 'completado'
		)
	`, jobID, studentID, empleadorID).Scan(&exists)
	return exists, err
}

// POST /protected/valoracion/empleador
func CrearValoracionEmpleador(db *sql.DB, c *gin.Context) {
	var v ValoracionEmpleador
	if err := c.ShouldBindJSON(&v); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// estudiante que valora
	estudianteID, err := getUserIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	ok, err := hasCompletedMatchWithEmployer(db, estudianteID, v.EmpleadorValoradoID, v.JobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error verificando match completado"})
		return
	}
	if !ok {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo puedes valorar empleadores con los que completaste un CameYo"})
		return
	}

	// evitar doble valoración
	var exists bool
	checkQuery := `
		SELECT EXISTS(
			SELECT 1 FROM valoracion_empleador
			WHERE empleador_valorado_id = $1
			  AND estudiante_valorador_id = $2
			  AND job_id = $3
		)
	`
	if err := db.QueryRow(checkQuery, v.EmpleadorValoradoID, estudianteID, v.JobID).Scan(&exists); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Ya valoraste a este empleador para este trabajo"})
		return
	}

	query := `
		INSERT INTO valoracion_empleador (
			empleador_valorado_id,
			estudiante_valorador_id,
			job_id,
			claridad_trabajo,
			respeto_trato,
			pago_cumplimiento,
			organizacion,
			ambiente_seguridad,
			rating
		) VALUES (
			$1,$2,$3,$4,$5,$6,$7,$8,$9
		)
		RETURNING id
	`
	var insertedID int
	err = db.QueryRow(
		query,
		v.EmpleadorValoradoID,
		estudianteID,
		v.JobID,
		v.ClaridadTrabajo,
		v.RespetoTrato,
		v.PagoCumplimiento,
		v.Organizacion,
		v.AmbienteSeguridad,
		v.Rating,
	).Scan(&insertedID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Valoración al empleador creada correctamente",
		"id":      insertedID,
	})
}

// GET /protected/valoracion/empleador/estado?empleador_id=&job_id=
func ObtenerValoracionEmpleador(db *sql.DB, c *gin.Context) {
	estudianteID, err := getUserIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	empleadorIDStr := c.Query("empleador_id")
	jobIDStr := c.Query("job_id")
	if empleadorIDStr == "" || jobIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "empleador_id y job_id son requeridos"})
		return
	}
	empleadorID, err := strconv.Atoi(empleadorIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "empleador_id inválido"})
		return
	}
	jobID, err := strconv.Atoi(jobIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "job_id inválido"})
		return
	}

	var (
		id      int
		rating  int
		claridad, respeto, pago, org, ambiente bool
	)
	err = db.QueryRow(`
		SELECT id, rating, claridad_trabajo, respeto_trato, pago_cumplimiento,
		       organizacion, ambiente_seguridad
		FROM valoracion_empleador
		WHERE empleador_valorado_id = $1
		  AND estudiante_valorador_id = $2
		  AND job_id = $3
	`, empleadorID, estudianteID, jobID).Scan(
		&id, &rating, &claridad, &respeto, &pago, &org, &ambiente,
	)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusOK, gin.H{"exists": false})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"exists":             true,
		"id":                 id,
		"rating":             rating,
		"claridad_trabajo":   claridad,
		"respeto_trato":      respeto,
		"pago_cumplimiento":  pago,
		"organizacion":       org,
		"ambiente_seguridad": ambiente,
	})
}