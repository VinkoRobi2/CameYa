package main

import (
	"database/sql"
	"fmt"
	"log"

	"os"
	"time"

	emp "github.com/VinkoRobi2/FlashWorkEC/Dashboards/empleadores"
	estud "github.com/VinkoRobi2/FlashWorkEC/Dashboards/estudiantes"
	jobs_empleador "github.com/VinkoRobi2/FlashWorkEC/Jobs/empleadores"
	jobsemp "github.com/VinkoRobi2/FlashWorkEC/Jobs/empleadores"
	jobsest "github.com/VinkoRobi2/FlashWorkEC/Jobs/estudiantes"
	"github.com/VinkoRobi2/FlashWorkEC/completar"
	"github.com/VinkoRobi2/FlashWorkEC/mensajeria"
	"github.com/VinkoRobi2/FlashWorkEC/middlewares"

	service "github.com/VinkoRobi2/FlashWorkEC/service/login"
	registro "github.com/VinkoRobi2/FlashWorkEC/service/register"
	valemp "github.com/VinkoRobi2/FlashWorkEC/valoraciones/empleadores"
	valestud "github.com/VinkoRobi2/FlashWorkEC/valoraciones/estudiantes"
	valoracion "github.com/VinkoRobi2/FlashWorkEC/valoraciones/estudiantes"
	"github.com/VinkoRobi2/FlashWorkEC/verify"
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
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000", "https://cameya.pages.dev"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type", "Access-Control-Allow-Methods", "Access-Control-Allow-Credentials"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	ms := mensajeria.New(db)

	// Rutas protegidas
	empleadores := r.Group("/protected")
	estudiantes := r.Group("/protected")
	both := r.Group("/protected")
	both.Use(middlewares.AuthMiddleware())
	estudiantes.Use(middlewares.AuthMiddleware())
	empleadores.Use(middlewares.AuthMiddleware())

	r.Any("/mensajes/estudiantes/:receiverID", ms.MessageHandler)
	r.Any("/mensajes/empleadores/:receiverID", ms.MessageHandler)

	estudiantes.GET("/perfil-privado-estudiante", func(ctx *gin.Context) {
		estud.Get_Estudiante_Info(ctx, db)
	})
	estudiantes.PATCH("/completar-perfil", func(ctx *gin.Context) {
		registro.UpdateWorkerProfileHandler(ctx, db)
	})

	both.GET("/mensajes/:receiverID", mensajeria.GetMensajesHandler(db))

	///////
	estudiantes.GET("/todos_trabajos", func(ctx *gin.Context) {
		jobsest.Get_Jobs_Abiertos(ctx, db)
	})
	estudiantes.GET("/mis-intereses", func(ctx *gin.Context) {
		jobsest.GetAllInteresesHandler(ctx, db)
	})
	estudiantes.POST("/guardar-interes", func(ctx *gin.Context) {
		jobsest.GuardarInteresEstudianteHandler(ctx, db)
	})
	estudiantes.POST("/editar-perfil-estudiante", func(ctx *gin.Context) {
		estud.EditarPerfilEstudiante(db, ctx)
	})

	estudiantes.POST("/valorar-empleador", func(ctx *gin.Context) {
		valemp.CrearValoracionEmpleador(db, ctx)
	})
	estudiantes.GET("/valoracion/empleador", func(ctx *gin.Context) {
		valemp.ObtenerValoracionEmpleador(db, ctx)
	})
	estudiantes.GET("/browse/empleadores", func(ctx *gin.Context) {
		jobsest.BrowseEmpleadoresHandler(ctx, db)
	})

	estudiantes.GET("/perfiles-publicos-estudiantes", func(ctx *gin.Context) {
		estud.Get_Estudiante_Publicos_List(ctx, db)
	})

	estudiantes.GET("/perfil-publico/:id", func(ctx *gin.Context) {
		estud.Get_Estudiante_Publico_By_ID(ctx, db)
	})

	estudiantes.GET("/matches/aceptados/estudiantes", func(ctx *gin.Context) {
		jobsest.GetMatchesEstudianteHandler(ctx, db)
	})

	estudiantes.GET("/trabajos-completados", func(ctx *gin.Context) {
		jobsest.GetTrabajosCompletadosEstudiante(db, ctx)
	})

	empleadores.PATCH("/completar-perfil-empleador", func(ctx *gin.Context) {
		registro.UpdateEmployerProfileHandler(ctx, db)
	})

	empleadores.GET("/trabajos-completados-emp", func(ctx *gin.Context) {
		jobsemp.GetTrabajosCompletadosEmpleador(db, ctx)
	})

	empleadores.POST("/borrar-trabajo", func(ctx *gin.Context) {
		jobsemp.DeleteJob(db, ctx)
	})

	empleadores.PATCH("/editar-trabajo", func(ctx *gin.Context) {
		jobsemp.EditJob(db, ctx)
	})

	empleadores.GET("/empleador/:id", func(ctx *gin.Context) {
		emp.Get_Empleador_Publico_Info(ctx, db)
	})

	////
	empleadores.GET("/perfiles-publicos-empleadores", func(c *gin.Context) {
		emp.Get_Empleadores_Publicos_List(c, db)

	})

	empleadores.POST("/matches/responder", func(ctx *gin.Context) {
		jobsemp.GuardarInteresEmpleadorHandler(ctx, db)
	})

	empleadores.GET("/ver-likes-empleador", func(ctx *gin.Context) {
		jobsemp.GetLikesDeEstudiantesParaEmpleador(ctx, db)
	})

	// Ejemplos
	estudiantes.POST("/completar/estudiante", func(c *gin.Context) {
		completar.EstudianteCompletarHandler(db, c)
	})

	empleadores.POST("/completar/empleador", func(c *gin.Context) {
		completar.EmpleadorCompletarHandler(db, c)
	})

	both.GET("/completar/estado", func(c *gin.Context) {
		completar.ObtenerEstadoMatchHandler(db, c)
	})

	empleadores.GET("/matches/aceptados", func(ctx *gin.Context) {
		jobsemp.GetMatchesEmpleadorHandler(ctx, db)
	})

	empleadores.POST("/info-empleador", func(ctx *gin.Context) {
		emp.GetOwnerByJobID(db, ctx)
	})

	empleadores.PATCH("/editar-perfil-empleador", func(ctx *gin.Context) {
		emp.UpdateEmpleador(ctx, db)
	})

	empleadores.GET("/perfil-privado-empleadores", func(ctx *gin.Context) {
		emp.Get_Empleador_Info(ctx, db)
	})
	empleadores.POST("/crear-trabajo", func(c *gin.Context) {
		jobs_empleador.CrearTrabajoHandler(c, db)
	})
	empleadores.GET("/trabajos_creados", func(ctx *gin.Context) {
		jobsemp.Get_Mis_Jobs(ctx, db)
	})
	empleadores.POST("/valorar-estudiante", func(ctx *gin.Context) {
		valestud.CrearValoracion(db, ctx)
	})
	empleadores.GET("/valoracion/estudiante", func(ctx *gin.Context) {
		valoracion.ObtenerValoracionEstudiante(db, ctx)
	})

	// Rutas públicas
	r.POST("/login", func(ctx *gin.Context) {
		service.LoginHandler(ctx, db)
	})
	r.Static("/uploads", "./uploads")
	r.POST("/register", func(ctx *gin.Context) {
		registro.RegisterHandler(ctx, db)
	})
	r.POST("/verify/:token", func(ctx *gin.Context) {
		verify.VerifyEmailHandler(ctx, db)
	})
	r.POST("/auth/resend-verification", func(c *gin.Context) {
		verify.ResendVerification(c, db)
	})

	if err := r.Run(":8080"); err != nil {
		log.Fatal("Error al iniciar el servidor: ", err)
	}
}
