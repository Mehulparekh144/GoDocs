package main

import (
	"fmt"
	"go-docs/cmd/server"
	"log"
	"net/http"

	"github.com/joho/godotenv"
)

func main() {
	fmt.Println("Hello World")
	_ = godotenv.Load()

	db := InitDB()
	redis := InitRedis()
	r := server.StartRestServer(db, redis)

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Failed to get database instance: %v", err)
	}
	defer sqlDB.Close()
	defer redis.Close()

	log.Println("Starting REST server on port 3001 🚀")
	if err := http.ListenAndServe(":3001", r); err != nil {
		log.Fatalf("Failed to start REST server: %v", err)
	}

}
