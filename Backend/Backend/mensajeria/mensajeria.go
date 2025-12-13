package mensajeria

import (
    "database/sql"
    "errors"
    "log"
    "net/http"
    "strconv"
    "strings"

    auth "github.com/VinkoRobi2/FlashWorkEC/service"
    "github.com/gin-gonic/gin"
    "github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool { return true },
}

type MensajeriaService struct {
    DB      *sql.DB
    Clients map[int]*websocket.Conn // key: userID
}

func New(db *sql.DB) *MensajeriaService {
    return &MensajeriaService{
        DB:      db,
        Clients: make(map[int]*websocket.Conn),
    }
}

func getUserIdFromJWT(c *gin.Context) (int, error) {
    var tokenStr string

    authHeader := c.GetHeader("Authorization")
    if strings.HasPrefix(authHeader, "Bearer ") {
        tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
    }

    if tokenStr == "" {
        tokenStr = c.Query("token")
    }

    if tokenStr == "" {
        return 0, errors.New("token faltante")
    }

    claims, err := auth.ValidateToken(tokenStr)
    if err != nil {
        return 0, errors.New("token inválido")
    }

    if claims.UserID == 0 {
        return 0, errors.New("user_id no encontrado en claims")
    }

    return claims.UserID, nil
}

func (ms *MensajeriaService) MessageHandler(c *gin.Context) {
    receiverIDStr := c.Param("receiverID")
    receiverID, err := strconv.Atoi(receiverIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "receiverID inválido"})
        return
    }

    jobIDStr := c.Query("jobId")
    jobID, err := strconv.Atoi(jobIDStr)
    if err != nil || jobID == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "jobId inválido"})
        return
    }

    senderID, err := getUserIdFromJWT(c)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
        return
    }

    // ==============================================
    //       🔵 WEBSOCKET MODE (si se desea)
    // ==============================================
    if websocket.IsWebSocketUpgrade(c.Request) {
        conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
        if err != nil {
            log.Println("WS upgrade error:", err)
            return
        }
        defer conn.Close()

        ms.Clients[senderID] = conn
        defer delete(ms.Clients, senderID)

        for {
            _, msg, err := conn.ReadMessage()
            if err != nil {
                log.Println("WS read error:", err)
                break
            }

            mensaje := strings.TrimSpace(string(msg))
            if mensaje == "" {
                continue
            }

            // Guardar SIEMPRE
            _, err = ms.DB.Exec(
                "INSERT INTO mensajes (sender_id, receiver_id, job_id, mensaje) VALUES ($1,$2,$3,$4)",
                senderID, receiverID, jobID, mensaje,
            )
            if err != nil {
                log.Println("DB insert error:", err)
                continue
            }

            // Enviar en vivo si el receptor está conectado
            if receiverConn, ok := ms.Clients[receiverID]; ok {
                receiverConn.WriteMessage(websocket.TextMessage, []byte(mensaje))
            }
        }

        return
    }

    // ==============================================
    //       🔵 POST MODE (envío normal)
    // ==============================================
    var body struct {
        Mensaje string `json:"mensaje"`
    }

    if err := c.BindJSON(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "json inválido"})
        return
    }

    mensaje := strings.TrimSpace(body.Mensaje)
    if mensaje == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "mensaje vacío"})
        return
    }

    // Guardar SIEMPRE (mensaje offline)
    _, err = ms.DB.Exec(
        "INSERT INTO mensajes (sender_id, receiver_id, job_id, mensaje) VALUES ($1,$2,$3,$4)",
        senderID, receiverID, jobID, mensaje,
    )
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "no se pudo guardar el mensaje"})
        return
    }

    // Enviar en vivo si el receptor está conectado
    if receiverConn, ok := ms.Clients[receiverID]; ok {
        receiverConn.WriteMessage(websocket.TextMessage, []byte(mensaje))
    }

    c.JSON(http.StatusOK, gin.H{"status": "mensaje enviado"})
}