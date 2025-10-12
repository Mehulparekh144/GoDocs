package main

import (
	"fmt"
	"go-docs/cmd/server"
	"go-docs/cmd/services"
	"log"
	"net/http"

	"github.com/joho/godotenv"
)

func main() {
	fmt.Println("Hello World")
	_ = godotenv.Load()

	db := InitDB()
	redis := InitRedis()

	userSearchTrie := services.PushUsersToTrie(db)
	log.Printf("Loaded users into search trie users")

	r := server.StartRestServer(db, redis, userSearchTrie)

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
