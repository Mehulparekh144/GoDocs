package services

import (
	"errors"
	"go-docs/cmd/models"
	"go-docs/cmd/utils"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{db: db}
}

func generateToken(userID string, expiresIn time.Duration) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(expiresIn).Unix(),
		"iat":     time.Now().Unix(),
	})

	return token.SignedString(utils.GetJWTSecret())
}

func (s *UserService) GetUser(userID string) (*models.User, error) {
	user := &models.User{}
	result := s.db.Where("id = ?", userID).First(user)
	if result.Error != nil {
		return nil, result.Error
	}
	return user, nil
}

func (s *UserService) RegisterUser(name, email, password string) error {
	user := &models.User{
		Name:     name,
		Email:    email,
		Password: passwordHash(password),
	}

	result := s.db.Where("email = ?", email).First(user)

	if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return result.Error
	}

	if result.RowsAffected > 0 {
		return errors.New("user already exists")
	}

	err := s.db.Create(user).Error
	if err != nil {
		return err
	}

	return nil
}

func (s *UserService) LoginUser(email, password string) (string, string, error) {
	user := &models.User{
		Email: email,
	}
	result := s.db.Where("email = ?", email).First(user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return "", "", errors.New("user not found")
		}
		return "", "", result.Error
	}

	if !passwordCompare(password, user.Password) {
		return "", "", errors.New("invalid credentials")
	}

	accessToken, err := generateToken(user.ID.String(), time.Minute*15)
	if err != nil {
		return "", "", err
	}

	refreshToken, err := generateToken(user.ID.String(), time.Hour*24)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func passwordCompare(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func passwordHash(password string) string {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return ""
	}
	return string(hash)
}

func RefreshToken(refreshToken string) (string, error) {
	userID, err := utils.ValidateToken(refreshToken)
	if err != nil {
		return "", err
	}

	return generateToken(userID, time.Minute*15)
}
