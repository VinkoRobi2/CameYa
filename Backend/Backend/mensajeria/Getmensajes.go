// service/mensajeria/mensajes_history.go (o en el mismo mensajeria.go)
package mensajeria

import (
    "database/sql"
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
)

type Mensaje struct {
    ID         int    `json:"id"`
    SenderID   int    `json:"sender_id"`
    ReceiverID int    `json:"receiver_id"`
    JobID      int    `json:"job_id"`
    Contenido  string `json:"contenido"`
    Fecha      string `json:"fecha"`
}

func GetMensajesHandler(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // 1) user logueado (sender = el que está mirando el chat)
        senderID, err := getUserIdFromJWT(c)
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
            return
        }

        // 2) receiver = otro usuario en la ruta
        // OJO: el param se llama receiverID en la ruta
        receiverParam := c.Param("receiverID")
        receiverID, err := strconv.Atoi(receiverParam)
        if err != nil || receiverID == 0 {
            c.JSON(http.StatusBadRequest, gin.H{"error": "receiverID inválido"})
            return
        }

        // 3) job_id = query param (?job_id=9)
        jobIDparam := c.Query("job_id")
        if jobIDparam == "" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "job_id requerido"})
            return
        }
        jobID, err := strconv.Atoi(jobIDparam)
        if err != nil || jobID == 0 {
            c.JSON(http.StatusBadRequest, gin.H{"error": "job_id inválido"})
            return
        }

        // 4) Seguridad simple: el que lee es necesariamente senderID,
        // y el otro participante es receiverID, así que no hace falta
        // el if raro que tenías (senderID != senderID era siempre falso).
        // Si quisieras endurecer, aquí podrías comprobar que senderID
        // es efectivamente empleador o estudiante asociado al job.

        query := `
            SELECT id, sender_id, receiver_id, job_id, mensaje AS contenido, creado_at
            FROM mensajes
            WHERE 
                ((sender_id = $1 AND receiver_id = $2)
              OR (sender_id = $2 AND receiver_id = $1))
              AND job_id = $3
            ORDER BY creado_at ASC
        `

        rows, err := db.Query(query, senderID, receiverID, jobID)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al consultar mensajes", "err":err.Error()})
            return
        }
        defer rows.Close()

        mensajes := []Mensaje{}
        for rows.Next() {
            var m Mensaje
            if err := rows.Scan(
                &m.ID,
                &m.SenderID,
                &m.ReceiverID,
                &m.JobID,
                &m.Contenido,
                &m.Fecha,
            ); err != nil {
                continue
            }
            mensajes = append(mensajes, m)
        }

        c.JSON(http.StatusOK, gin.H{
            "mensajes": mensajes,
        })
    }
}