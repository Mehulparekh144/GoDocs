package server

import (
	"go-docs/cmd/server/handler"
	"go-docs/cmd/server/middleware"
	"go-docs/cmd/server/validator"
	"go-docs/cmd/services"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func StartRestServer(db *gorm.DB, redis *redis.Client) *chi.Mux {
	r := chi.NewRouter()
	validator := validator.NewValidator()
	documentService := services.NewDocumentService(db, redis)
	userService := services.NewUserService(db)
	userHandler := handler.NewUserHandler(userService, validator)
	documentHandler := handler.NewDocumentHandler(documentService, validator)
	socketHandler := handler.NewSocketHandler()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{os.Getenv("CLIENT_URL")},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		ExposedHeaders:   []string{"*"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Route("/api/v1", func(r chi.Router) {
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", userHandler.RegisterUser)
			r.Post("/login", userHandler.LoginUser)
			r.Post("/refresh-token", userHandler.RefreshToken)
			r.Post("/logout", userHandler.LogoutUser)
		})
		r.Route("/user", func(r chi.Router) {
			r.Use(middleware.AuthMiddleware)
			r.Get("/me", userHandler.GetUser)
		})
		r.Route("/document", func(r chi.Router) {
			r.Use(middleware.AuthMiddleware)
			r.Post("/", documentHandler.CreateDocument)
			r.Put("/{documentID}", documentHandler.CreateDocument)
			r.Get("/", documentHandler.GetDocuments)
			r.Get("/{documentID}", documentHandler.GetDocument)
			r.Route("/colab", func(r chi.Router) {
				r.Post("/{documentID}", documentHandler.AddCollaborator)
				r.Get("/{documentID}", documentHandler.GetCollaborators)
				r.Delete("/{documentID}", documentHandler.RemoveCollaborator)
			})
		})
		r.Get("/test-ws", socketHandler.ServeTestWS)
	})

	return r
}
