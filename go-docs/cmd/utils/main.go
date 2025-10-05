package utils

import (
	"encoding/json"
	"errors"
	"go-docs/cmd/models"
	"go-docs/cmd/server/dto"
	"log"
	"net/http"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

func GetJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Fatal("JWT_SECRET environment variable is not set")
	}
	return []byte(secret)
}

func ValidateToken(token string) (string, error) {
	parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (any, error) {
		// Check if the signing method is HMAC
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return GetJWTSecret(), nil
	})

	if err != nil {
		log.Printf("JWT Parse Error: %v", err)
		return "", err
	}

	if !parsedToken.Valid {
		log.Println("Token is not valid")
		return "", errors.New("invalid token")
	}

	claims, ok := parsedToken.Claims.(jwt.MapClaims)
	if !ok {
		log.Println("Failed to parse claims")
		return "", errors.New("invalid token claims")
	}

	userID, ok := claims["user_id"].(string)
	if !ok {
		log.Println("user_id claim is not a string")
		return "", errors.New("invalid user_id claim")
	}

	return userID, nil
}

func GetErrorResponse(title, message string, w http.ResponseWriter, statusCode int) {
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(dto.ErrorResponse{
		Title:   title,
		Message: message,
	})
}

func UpdatedContent(content string, op models.DocumentOperation) string {
	runes := []rune(content)

	if op.OperationType == models.OperationTypeInsert {
		return string(runes[:op.Pos]) + op.Content + string(runes[op.Pos:])
	} else {
		return string(runes[:op.Pos]) + op.Content + string(runes[op.Pos+op.DeleteLen:])
	}
}
