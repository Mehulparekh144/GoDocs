package main

import (
	"go-docs/cmd/models"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var Tables = []any{&models.User{}, &models.Document{}, &models.DocumentCollaborator{}}

func InitDB() *gorm.DB {

	connectionString := os.Getenv("POSTGRES_URI")

	db, err := gorm.Open(postgres.Open(connectionString))
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	err = db.AutoMigrate(Tables...)
	if err != nil {
		log.Fatalf("Failed to migrate tables: %v", err)
	}

	log.Println("Connected to Database 📀")
	return db
}
