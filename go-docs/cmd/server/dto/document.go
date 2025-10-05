package dto

import (
	"go-docs/cmd/models"
)

type CreateDocumentRequest struct {
	Title   string `json:"title" validate:"required"`
	Content string `json:"content" validate:"required"`
}

type CreateDocumentResponse struct {
	Message string `json:"message"`
}

type AddCollaboratorRequest struct {
	UserID string             `json:"userID"`
	Access models.AccessLevel `json:"access"`
}

type GetCollaboratorsResponse struct {
	UserID string             `json:"userID"`
	Access models.AccessLevel `json:"access"`
}
type RemoveCollaboratorRequest struct {
	UserID string `json:"userID"`
}
