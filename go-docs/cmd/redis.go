package main

import (
	"context"
	"log"
	"os"

	"github.com/redis/go-redis/v9"
)

var redisClient *redis.Client
var ctx = context.Background()

func InitRedis() *redis.Client {
	redisURI := os.Getenv("REDIS_URI")
	if redisURI == "" {
		redisURI = "localhost:6379"
	}

	redisClient = redis.NewClient(&redis.Options{
		Addr:     redisURI,
		Password: "",
		DB:       0, // Default DB
	})

	_, err := redisClient.Ping(context.Background()).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	log.Println("Connected to Redis 🔴")
	return redisClient
}
