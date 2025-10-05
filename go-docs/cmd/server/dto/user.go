package dto

import "github.com/google/uuid"

type RegisterUserRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

type RegisterUserResponse struct {
	Message string `json:"message"`
}

type LoginUserRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

type LoginUserResponse struct {
	Message     string `json:"message"`
	AccessToken string `json:"access_token"`
}

type GetUserResponse struct {
	ID    uuid.UUID `json:"id"`
	Email string    `json:"email"`
}

type RefreshTokenResponse struct {
	Message     string `json:"message"`
	AccessToken string `json:"access_token"`
}
