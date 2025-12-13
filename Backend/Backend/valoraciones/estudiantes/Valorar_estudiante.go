package valoracion

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"
	"strings"

	auth "github.com/VinkoRobi2/FlashWorkEC/service"
	"github.com/gin-gonic/gin"
)

type ValoracionEstudiante struct {
	EstudianteValoradoID int    `json:"estudiante_valorado_id" binding:"required"`
	JobID                int    `json:"job_id" binding:"required"`
	Rating               int    `json:"rating" binding:"required,min=1,max=5"`
	Comentario           string `json:"comentario"`
	ResponsablePuntual   bool   `json:"responsable_puntual"`
	CalidadTrabajo       bool   `json:"calidad_trabajo"`
	BuenaComunicacion    bool   `json:"buena_comunicacion"`
	BuenaActitud         bool   `json:"buena_actitud"`
	Autonomo             bool   `json:"autonomo"`
	NoSePresento         bool   `json:"no_se_presento"`
	CanceloUltimaHora    bool   `json:"cancelo_ultima_hora"`
	FaltaRespeto         bool   `json:"falta_respeto"`
	NoTerminoTrabajo     bool   `json:"no_termino_trabajo"`
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

// Verificar que haya match COMPLETADO entre ese empleador y ese estudiante
func hasCompletedMatchWithStudent(db *sql.DB, empleadorID, estudianteID, jobID int) (bool, error) {
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
	`, jobID, estudianteID, empleadorID).Scan(&exists)
	return exists, err
}

// POST /protected/valoracion/estudiante
func CrearValoracion(db *sql.DB, c *gin.Context) {
	var v ValoracionEstudiante
	if err := c.ShouldBindJSON(&v); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	empleadorID, err := getUserIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	ok, err := hasCompletedMatchWithStudent(db, empleadorID, v.EstudianteValoradoID, v.JobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error verificando match completado"})
		return
	}
	if !ok {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo puedes valorar estudiantes con los que completaste un CameYo"})
		return
	}

	var exists bool
	checkQuery := `
		SELECT EXISTS(
			SELECT 1
			FROM valoracion_estudiante
			WHERE estudiante_valorado_id = $1
			  AND empleador_valorador_id = $2
			  AND job_id = $3
		)
	`
	if err := db.QueryRow(checkQuery, v.EstudianteValoradoID, empleadorID, v.JobID).Scan(&exists); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Este estudiante ya ha sido valorado para este mismo trabajo por este empleador"})
		return
	}

	query := `
		INSERT INTO valoracion_estudiante (
			estudiante_valorado_id,
			empleador_valorador_id,
			job_id,
			rating,
			comentario,
			responsable_puntual,
			calidad_trabajo,
			buena_comunicacion,
			buena_actitud,
			autonomo,
			no_se_presento,
			cancelo_ultima_hora,
			falta_respeto,
			no_termino_trabajo
		) VALUES (
			$1,$2,$3,
			$4,$5,
			$6,$7,$8,$9,$10,
			$11,$12,$13,$14
		)
		RETURNING id
	`
	var insertedID int
	err = db.QueryRow(
		query,
		v.EstudianteValoradoID,
		empleadorID,
		v.JobID,
		v.Rating,
		v.Comentario,
		v.ResponsablePuntual,
		v.CalidadTrabajo,
		v.BuenaComunicacion,
		v.BuenaActitud,
		v.Autonomo,
		v.NoSePresento,
		v.CanceloUltimaHora,
		v.FaltaRespeto,
		v.NoTerminoTrabajo,
	).Scan(&insertedID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Valoración creada correctamente", "id": insertedID})
}

// GET /protected/valoracion/estudiante/estado?estudiante_id=&job_id=
func ObtenerValoracionEstudiante(db *sql.DB, c *gin.Context) {
	empleadorID, err := getUserIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	estudianteIDStr := c.Query("estudiante_id")
	jobIDStr := c.Query("job_id")
	if estudianteIDStr == "" || jobIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "estudiante_id y job_id son requeridos"})
		return
	}
	estudianteID, err := strconv.Atoi(estudianteIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "estudiante_id inválido"})
		return
	}
	jobID, err := strconv.Atoi(jobIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "job_id inválido"})
		return
	}

	var (
		id, rating                       int
		comentario                       string
		resp, cal, com, act, aut         bool
		ns, canc, falta, noterm          bool
	)
	err = db.QueryRow(`
		SELECT id, rating, comentario,
		       responsable_puntual, calidad_trabajo, buena_comunicacion,
		       buena_actitud, autonomo,
		       no_se_presento, cancelo_ultima_hora, falta_respeto, no_termino_trabajo
		FROM valoracion_estudiante
		WHERE estudiante_valorado_id = $1
		  AND empleador_valorador_id = $2
		  AND job_id = $3
	`, estudianteID, empleadorID, jobID).Scan(
		&id, &rating, &comentario,
		&resp, &cal, &com, &act, &aut,
		&ns, &canc, &falta, &noterm,
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
		"exists":              true,
		"id":                  id,
		"rating":              rating,
		"comentario":          comentario,
		"responsable_puntual": resp,
		"calidad_trabajo":     cal,
		"buena_comunicacion":  com,
		"buena_actitud":       act,
		"autonomo":            aut,
		"no_se_presento":      ns,
		"cancelo_ultima_hora": canc,
		"falta_respeto":       falta,
		"no_termino_trabajo":  noterm,
	})
}