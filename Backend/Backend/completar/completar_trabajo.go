package completar

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"
	"strings"

	auth "github.com/VinkoRobi2/FlashWorkEC/service"
	"github.com/gin-gonic/gin"
)

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
		return 0, errors.New("user_id no encontrado en las claims")
	}

	return claims.UserID, nil
}

// -------------------------------
// HANDLER: Estudiante completa (por match_id)
// -------------------------------
func EstudianteCompletarHandler(db *sql.DB, c *gin.Context) {

	studentID, err := getUserIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "token inválido"})
		return
	}

	var body struct {
		MatchID int `json:"match_id"`
		JobID   int `json:"job_id"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "body inválido"})
		return
	}

	if body.MatchID == 0 || body.JobID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "match_id y job_id son requeridos"})
		return
	}

	// Validar que el match exista y pertenezca a ese estudiante + job
	var exists bool
	err = db.QueryRow(`
		SELECT EXISTS(
			SELECT 1
			FROM matches_job
			WHERE id = $1
			  AND estudiante_id = $2
			  AND job_id = $3
		)
	`, body.MatchID, studentID, body.JobID).Scan(&exists)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error verificando match"})
		return
	}
	if !exists {
		c.JSON(http.StatusForbidden, gin.H{"error": "no tienes permiso sobre este match / job"})
		return
	}

	// Marcar completado por parte del estudiante
	_, err = db.Exec(`
        UPDATE matches_job
        SET student_completed = TRUE
        WHERE id = $1
    `, body.MatchID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error actualizando estado del estudiante"})
		return
	}

	// Lógica híbrida
	studentDone, employerDone, estado, err := completarSiAmbos(db, body.MatchID, body.JobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error consultando estado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":            "Estudiante marcó como completado",
		"student_completed":  studentDone,
		"employer_completed": employerDone,
		"estado":             estado,
	})
}

// -------------------------------
// HANDLER: Empleador completa (por match_id)
// -------------------------------
func EmpleadorCompletarHandler(db *sql.DB, c *gin.Context) {

	employerID, err := getUserIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "token inválido"})
		return
	}

	var body struct {
		MatchID int `json:"match_id"`
		JobID   int `json:"job_id"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "body inválido"})
		return
	}

	if body.MatchID == 0 || body.JobID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "match_id y job_id son requeridos"})
		return
	}

	// Validar que el match exista y que ese empleador sea dueño del job
	var exists bool
	err = db.QueryRow(`
		SELECT EXISTS(
			SELECT 1
			FROM matches_job mj
			JOIN jobs j ON mj.job_id = j.id
			WHERE mj.id = $1
			  AND mj.job_id = $2
			  AND j.empleador_id = $3
		)
	`, body.MatchID, body.JobID, employerID).Scan(&exists)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error verificando match"})
		return
	}
	if !exists {
		c.JSON(http.StatusForbidden, gin.H{"error": "no tienes permiso sobre este match / job"})
		return
	}

	// Marcar completado por parte del empleador
	_, err = db.Exec(`
        UPDATE matches_job
        SET employer_completed = TRUE
        WHERE id = $1
    `, body.MatchID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error actualizando estado del empleador"})
		return
	}

	// Lógica híbrida
	studentDone, employerDone, estado, err := completarSiAmbos(db, body.MatchID, body.JobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error consultando estado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":            "Empleador marcó como completado",
		"student_completed":  studentDone,
		"employer_completed": employerDone,
		"estado":             estado,
	})
}

// ------------------------------------------------------
// FUNCIÓN: Completar match y job según ambos flags
// (modelo híbrido sobre matches_job)
// ------------------------------------------------------
func completarSiAmbos(db *sql.DB, matchID int, jobID int) (bool, bool, string, error) {

	var studentDone, employerDone bool
	var estado sql.NullString

	err := db.QueryRow(`
        SELECT student_completed, employer_completed, estado 
        FROM matches_job
        WHERE id = $1
    `, matchID).Scan(&studentDone, &employerDone, &estado)

	if err != nil {
		return false, false, "", err
	}

	currentEstado := ""
	if estado.Valid {
		currentEstado = estado.String
	}

	if studentDone && employerDone {
		// Ambos marcaron → completado total
		if currentEstado != "completado" {
			_, _ = db.Exec(`
                UPDATE matches_job
                SET estado = 'completado'
                WHERE id = $1
            `, matchID)
		}

		// Si quieres que el job completo quede cerrado con el primer match cerrado:
		_, _ = db.Exec(`
            UPDATE jobs
            SET estado = 'completado'
            WHERE id = $1
        `, jobID)

		currentEstado = "completado"
	} else if studentDone && !employerDone {
		if currentEstado == "" || currentEstado == "en_progreso" {
			_, _ = db.Exec(`
                UPDATE matches_job
                SET estado = 'pendiente_confirmacion_empleador'
                WHERE id = $1
            `, matchID)
			currentEstado = "pendiente_confirmacion_empleador"
		}
	} else if employerDone && !studentDone {
		if currentEstado == "" || currentEstado == "en_progreso" {
			_, _ = db.Exec(`
                UPDATE matches_job
                SET estado = 'pendiente_confirmacion_estudiante'
                WHERE id = $1
            `, matchID)
			currentEstado = "pendiente_confirmacion_estudiante"
		}
	} else {
		if currentEstado == "" {
			currentEstado = "en_progreso"
		}
	}

	return studentDone, employerDone, currentEstado, nil
}

// ------------------------------------------------------
// HANDLER: Obtener estado de un match (vía match_id + job_id)
// ------------------------------------------------------
func ObtenerEstadoMatchHandler(db *sql.DB, c *gin.Context) {

	userID, err := getUserIdFromJWT(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "token inválido"})
		return
	}

	matchIDStr := c.Query("match_id")
	jobIDStr := c.Query("job_id")

	if matchIDStr == "" || jobIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "match_id y job_id son requeridos"})
		return
	}

	matchID, err := strconv.Atoi(matchIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "match_id inválido"})
		return
	}

	jobID, err := strconv.Atoi(jobIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "job_id inválido"})
		return
	}

	var (
		estudianteID int
		empleadorID  int
		studentDone  bool
		employerDone bool
		estado       sql.NullString
	)

	// Resolvemos todo a partir del match
	err = db.QueryRow(`
		SELECT 
			mj.estudiante_id,
			j.empleador_id,
			mj.student_completed,
			mj.employer_completed,
			mj.estado
		FROM matches_job mj
		JOIN jobs j ON mj.job_id = j.id
		WHERE mj.id = $1
		  AND mj.job_id = $2
	`, matchID, jobID).Scan(&estudianteID, &empleadorID, &studentDone, &employerDone, &estado)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "match no encontrado"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error consultando estado del match"})
		return
	}

	if userID != estudianteID && userID != empleadorID {
		c.JSON(http.StatusForbidden, gin.H{"error": "no tienes permiso sobre este match"})
		return
	}

	currentEstado := "en_progreso"
	if estado.Valid && estado.String != "" {
		currentEstado = estado.String
	}

	c.JSON(http.StatusOK, gin.H{
		"student_completed":  studentDone,
		"employer_completed": employerDone,
		"estado":             currentEstado,
	})
}