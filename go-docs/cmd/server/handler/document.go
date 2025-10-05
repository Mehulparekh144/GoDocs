package handler

import (
	"encoding/json"
	"go-docs/cmd/server/dto"
	"go-docs/cmd/server/middleware"
	"go-docs/cmd/server/validator"
	"go-docs/cmd/services"
	"go-docs/cmd/utils"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type DocumentHandler struct {
	documentService *services.DocumentService
	validator       *validator.Validator
}

func NewDocumentHandler(documentService *services.DocumentService, validator *validator.Validator) *DocumentHandler {
	return &DocumentHandler{documentService: documentService, validator: validator}
}

func (h *DocumentHandler) CreateDocument(w http.ResponseWriter, r *http.Request) {
	documentID := chi.URLParam(r, "documentID")
	var document dto.CreateDocumentRequest

	if err := json.NewDecoder(r.Body).Decode(&document); err != nil {
		utils.GetErrorResponse("Bad Request", err.Error(), w, http.StatusBadRequest)
		return
	}

	if err := h.validator.Struct(&document); err != nil {
		utils.GetErrorResponse("Unprocessable Entity", err.Error(), w, http.StatusUnprocessableEntity)
		return
	}

	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		utils.GetErrorResponse("Unauthorized", "Unauthorized", w, http.StatusUnauthorized)
		return
	}

	if err := h.documentService.CreateDocument(document.Title, document.Content, documentID, userID); err != nil {
		utils.GetErrorResponse("Internal Server Error", err.Error(), w, http.StatusInternalServerError)
		return
	}

	response := dto.CreateDocumentResponse{
		Message: "Document created successfully",
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *DocumentHandler) GetDocuments(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		utils.GetErrorResponse("Unauthorized", "Unauthorized", w, http.StatusUnauthorized)
		return
	}

	documents, err := h.documentService.GetDocuments(userID)
	if err != nil {
		utils.GetErrorResponse("Internal Server Error", err.Error(), w, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(documents)
}

func (h *DocumentHandler) GetDocument(w http.ResponseWriter, r *http.Request) {
	documentID := chi.URLParam(r, "documentID")
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		utils.GetErrorResponse("Unauthorized", "Unauthorized", w, http.StatusUnauthorized)
		return
	}

	documents, err := h.documentService.GetDocument(userID, documentID)
	if err != nil {
		utils.GetErrorResponse("Internal Server Error", err.Error(), w, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(documents)
}

func (h *DocumentHandler) AddCollaborator(w http.ResponseWriter, r *http.Request) {
	documentID := chi.URLParam(r, "documentID")
	var addCollaboratorBody dto.AddCollaboratorRequest

	if err := json.NewDecoder(r.Body).Decode(&addCollaboratorBody); err != nil {
		utils.GetErrorResponse("Bad Request", err.Error(), w, http.StatusBadRequest)
		return
	}

	if err := h.documentService.AddCollaborator(documentID, addCollaboratorBody.UserID, addCollaboratorBody.Access); err != nil {
		utils.GetErrorResponse("Internal Server Error", err.Error(), w, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *DocumentHandler) GetCollaborators(w http.ResponseWriter, r *http.Request) {
	documentID := chi.URLParam(r, "documentID")

	collaborators, err := h.documentService.GetCollaborators(documentID)
	if err != nil {
		utils.GetErrorResponse("Internal Server Error", err.Error(), w, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(collaborators)
}

func (h *DocumentHandler) RemoveCollaborator(w http.ResponseWriter, r *http.Request) {
	documentID := chi.URLParam(r, "documentID")
	authorID, ok := middleware.GetUserIDFromContext(r.Context())

	if !ok {
		utils.GetErrorResponse("Unauthorized", "Unauthorized", w, http.StatusUnauthorized)
		return
	}

	var body dto.RemoveCollaboratorRequest

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.GetErrorResponse("Bad Request", err.Error(), w, http.StatusBadRequest)
		return
	}

	if err := h.documentService.RemoveCollaborator(documentID, body.UserID, authorID); err != nil {
		utils.GetErrorResponse("Internal Server Error", err.Error(), w, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
