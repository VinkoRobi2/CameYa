package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	job "github.com/VinkoRobi2/FlashWorkEC/Jobs"
	"github.com/VinkoRobi2/FlashWorkEC/middlewares"
	service "github.com/VinkoRobi2/FlashWorkEC/service/login"
	registro "github.com/VinkoRobi2/FlashWorkEC/service/register"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func init() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error al cargar el archivo .env")
	}
}

func SetupDatabase() (*sql.DB, error) {
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}
	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}
	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}
	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "postgres"
	}
	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "flashwork"
	}

	psqlInfo := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname,
	)

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}
	return db, nil
}

func main() {
	// DB
	db, err := SetupDatabase()
	if err != nil {
		log.Fatal("Error al conectar con la base de datos: ", err)
	}
	defer db.Close()

	// Gin + CORS
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000", "https://flashworkec.pages.dev"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type", "Access-Control-Allow-Methods", "Access-Control-Allow-Credentials"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Rutas protegidas
	empleadores := r.Group("/protected")
	empleadores.Use(middlewares.AuthMiddleware())
	empleadores.POST("/create-job", func(c *gin.Context) {
		job.CreateJobHandler(c, db)
	})

	// Rutas públicas
	r.POST("/login", func(ctx *gin.Context) {
		service.LoginHandler(ctx, db)
	})
	r.POST("/register", func(ctx *gin.Context) {
		registro.RegisterHandler(ctx, db)
	})

	if err := r.Run(":8080"); err != nil {
		log.Fatal("Error al iniciar el servidor: ", err)
	}
}