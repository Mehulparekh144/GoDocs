package handler

import (
	"encoding/json"
	"go-docs/cmd/server/dto"
	"go-docs/cmd/server/middleware"
	"go-docs/cmd/server/validator"
	"go-docs/cmd/services"
	"go-docs/cmd/utils"
	"log"
	"net/http"
	"time"
)

type UserHandler struct {
	userService *services.UserService
	validator   *validator.Validator
}

func NewUserHandler(userService *services.UserService, validator *validator.Validator) *UserHandler {
	return &UserHandler{userService: userService, validator: validator}
}

func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		utils.GetErrorResponse("Unauthorized", "Unauthorized", w, http.StatusUnauthorized)
		return
	}

	user, err := h.userService.GetUser(userID)
	if err != nil {
		utils.GetErrorResponse("Internal Server Error", err.Error(), w, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(&dto.GetUserResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	})
}

func (h *UserHandler) RegisterUser(w http.ResponseWriter, r *http.Request) {
	var user dto.RegisterUserRequest
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		utils.GetErrorResponse("Bad Request", err.Error(), w, http.StatusBadRequest)
		return
	}

	if err := h.validator.Struct(&user); err != nil {
		utils.GetErrorResponse("Unprocessable Entity", err.Error(), w, http.StatusUnprocessableEntity)
		return
	}

	if err := h.userService.RegisterUser(user.Name, user.Email, user.Password); err != nil {
		utils.GetErrorResponse("Internal server error", err.Error(), w, http.StatusInternalServerError)
		return
	}

	response := dto.RegisterUserResponse{
		Message: "User registered successfully",
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *UserHandler) LoginUser(w http.ResponseWriter, r *http.Request) {
	var user dto.LoginUserRequest
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		utils.GetErrorResponse("Bad Request", err.Error(), w, http.StatusBadRequest)
		return
	}

	if err := h.validator.Struct(&user); err != nil {
		utils.GetErrorResponse("Unprocessable Entity", err.Error(), w, http.StatusUnprocessableEntity)
		return
	}

	accessToken, refreshToken, err := h.userService.LoginUser(user.Email, user.Password)
	if err != nil {
		utils.GetErrorResponse("Internal Server Error", err.Error(), w, http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refreshToken",
		Value:    refreshToken,
		HttpOnly: true,
		Secure:   true,
		Path:     "/",
		SameSite: http.SameSiteNoneMode,
		MaxAge:   int(time.Hour * 24),
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "accessToken",
		Value:    accessToken,
		HttpOnly: true,
		Secure:   true,
		Path:     "/",
		SameSite: http.SameSiteNoneMode,
		MaxAge:   int(time.Minute * 15),
	})

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(&dto.LoginUserResponse{
		Message: "Login successful",
	})
}

func (h *UserHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refreshToken")

	if err != nil {
		utils.GetErrorResponse("Unauthorized", err.Error(), w, http.StatusUnauthorized)
		return
	}

	log.Println("Refresh Token: ", cookie.Value)

	if cookie.Value == "" {
		utils.GetErrorResponse("Unauthorized", "Unauthorized", w, http.StatusUnauthorized)
		return
	}

	refreshToken := cookie.Value

	accessToken, err := services.RefreshToken(refreshToken)
	if err != nil {
		utils.GetErrorResponse("Internal Server Error", err.Error(), w, http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "accessToken",
		Value:    accessToken,
		HttpOnly: true,
		Secure:   true,
		Path:     "/",
		SameSite: http.SameSiteNoneMode,
		MaxAge:   int(time.Minute * 15),
	})

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(&dto.RefreshTokenResponse{
		Message: "Token refreshed successfully",
	})

}

func (h *UserHandler) LogoutUser(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refreshToken")
	if err != nil {
		utils.GetErrorResponse("Unauthorized", err.Error(), w, http.StatusUnauthorized)
		return
	}

	if cookie.Value == "" {
		w.WriteHeader(http.StatusOK)
		return
	}

	newCookie := http.Cookie{
		Name:     "refreshToken",
		Value:    "",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
		Path:     "/",
		MaxAge:   -1,
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "accessToken",
		Value:    "",
		HttpOnly: true,
		Secure:   true,
		Path:     "/",
		SameSite: http.SameSiteNoneMode,
		MaxAge:   -1,
	})

	http.SetCookie(w, &newCookie)

	w.WriteHeader(http.StatusOK)
}
