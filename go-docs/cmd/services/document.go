package services

import (
	"context"
	"encoding/json"
	"errors"
	"go-docs/cmd/models"
	"go-docs/cmd/server/dto"
	"go-docs/cmd/utils"
	"log"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type DocumentService struct {
	db             *gorm.DB
	redis          *redis.Client
	operationCache sync.Map
	userSearchTrie *UserSearchService
}

func NewDocumentService(db *gorm.DB, redis *redis.Client, userSearchTrie *UserSearchService) *DocumentService {
	return &DocumentService{db: db, redis: redis, operationCache: sync.Map{}, userSearchTrie: userSearchTrie}
}

func (s *DocumentService) CreateDocument(title, content, documentID, authorID string) (string, error) {
	parsedAuthorID := uuid.MustParse(authorID)
	newDocument := &models.Document{
		Title:    title,
		Content:  content,
		AuthorID: parsedAuthorID,
	}

	if documentID == "" {
		err := s.db.Create(newDocument).Error
		if err != nil {
			return "", err
		}
		return newDocument.ID.String(), nil
	}

	result := s.db.Model(&models.Document{}).Where("id = ?", documentID).Updates(
		newDocument,
	)
	if result.Error != nil {
		return "", result.Error
	}

	newDocument = &models.Document{}
	result = s.db.Where("id = ?", documentID).First(newDocument)
	if result.Error != nil {
		return "", result.Error
	}

	s.operationCache.Store(documentID, &models.OperationCache{
		ActiveDocument: newDocument,
		Operations:     []models.DocumentOperation{},
		LastUsed:       time.Now(),
		Dirty:          false,
	})
	s.saveDocumentToRedis(newDocument)

	return documentID, nil
}

func (s *DocumentService) GetDocuments(authorID string) ([]models.Document, error) {
	document := []models.Document{}
	result := s.db.Preload("Author").Preload("Collaborator").Where("author_id = ?", authorID).Find(&document)

	if result.Error != nil {
		return nil, result.Error
	}

	return document, nil
}

func (s *DocumentService) GetDocument(userId string, documentID string) (*models.Document, error) {
	document := &models.Document{}
	colab := &models.DocumentCollaborator{}

	cache, err := s.getActiveDocument(documentID)
	if err != nil {
		return nil, err
	}

	document = cache.ActiveDocument
	if document.AuthorID == uuid.MustParse(userId) {
		return document, nil
	}

	colabResults := s.db.Where("document_id = ? AND user_id = ?", documentID, userId).First(colab)

	if colabResults.Error != nil && !errors.Is(colabResults.Error, gorm.ErrRecordNotFound) {
		return nil, colabResults.Error
	}
	return document, nil

}

func (s *DocumentService) AddCollaborator(documentID, userID string, accessLevel models.AccessLevel) error {

	document := &models.Document{}
	result := s.db.Where("id = ?", documentID).First(document)

	if result.Error != nil {
		return result.Error
	}

	if document.AuthorID == uuid.MustParse(userID) {
		return errors.New("you cannot add yourself as a collaborator")
	}

	user := &models.User{}
	result = s.db.Where("id = ?", userID).First(user)

	if result.Error != nil {
		return result.Error
	}

	existingCollaborator := &models.DocumentCollaborator{}
	result = s.db.Where("document_id = ? AND user_id = ?", documentID, userID).First(existingCollaborator)

	if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return result.Error
	}

	if result.RowsAffected > 0 {
		return errors.New("collaborator already exists")
	}

	collaborator := &models.DocumentCollaborator{
		DocumentID: uuid.MustParse(documentID),
		UserID:     uuid.MustParse(userID),
		Access:     accessLevel,
	}

	return s.db.Create(collaborator).Error
}

func (s *DocumentService) GetCollaborators(documentID string) ([]dto.GetCollaboratorsResponse, error) {
	collaborators := []models.DocumentCollaborator{}

	result := s.db.Preload("User").Select("user, user_id, access").Where("document_id = ?", documentID).Find(&collaborators)

	if result.Error != nil {
		return nil, result.Error
	}

	collaboratorsResponse := []dto.GetCollaboratorsResponse{}
	for _, collaborator := range collaborators {
		collaboratorsResponse = append(collaboratorsResponse, dto.GetCollaboratorsResponse{
			UserID: collaborator.UserID.String(),
			User:   collaborator.User,
			Access: collaborator.Access,
		})
	}

	return collaboratorsResponse, nil
}

func (s *DocumentService) RemoveCollaborator(documentID, userID, authorID string) error {

	document := &models.Document{}
	result := s.db.Where("id = ?", documentID).First(document)
	if result.Error != nil {
		return result.Error
	}

	if document.AuthorID != uuid.MustParse(authorID) {
		return errors.New("you are not the author of the document")
	}

	result = s.db.Where("document_id = ? AND user_id = ?", documentID, userID).
		Delete(&models.DocumentCollaborator{})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("collaborator not found")
	}

	return nil
}

/*
1. We get the event from websocket
2. Get the document from the redis or db
3. Apply the OT to the document
4. Save the document to the redis or db
*/
func (s *DocumentService) OperationEvent(op models.DocumentOperation) error {
	cache, err := s.getActiveDocument(op.DocumentID.String())
	if err != nil {
		return err
	}

	document := cache.ActiveDocument
	cache.Mu.Lock()
	defer cache.Mu.Unlock()

	if op.BaseVersion < document.Version {
		newerVersions := s.getOperationsSince(op.BaseVersion, document.ID)

		for _, newerOp := range newerVersions {
			op = s.operationalTransform(op, newerOp)
		}
	}

	document.Content = utils.UpdatedContent(document.Content, op)
	document.Version++
	cache.Operations = append(cache.Operations, op)
	if len(cache.Operations) > 200 {
		cache.Operations = cache.Operations[len(cache.Operations)-200:]
	}
	cache.Dirty = true // We will only mark it false if we save the document to DB only !
	cache.LastUsed = time.Now()

	s.operationCache.Store(document.ID.String(), cache)

	s.saveDocumentToRedis(document)

	return nil
}

func (s *DocumentService) operationalTransform(incoming, applied models.DocumentOperation) models.DocumentOperation {

	switch applied.OperationType {
	case models.OperationTypeInsert:
		len := len([]rune(applied.Content))
		if applied.Pos <= incoming.Pos {
			incoming.Pos += len
		}
	case models.OperationTypeDelete:
		deletedLength := applied.DeleteLen

		if applied.Pos+deletedLength <= incoming.Pos {
			incoming.Pos -= deletedLength
		} else if applied.Pos < incoming.Pos && applied.Pos+deletedLength > incoming.Pos {
			incoming.Pos = applied.Pos
		}

	case models.OperationTypeReplace:
		diff := len([]rune(applied.Content)) - applied.DeleteLen
		if applied.Pos+applied.DeleteLen <= incoming.Pos {
			incoming.Pos += diff
		} else if applied.Pos < incoming.Pos && applied.Pos+applied.DeleteLen > incoming.Pos {
			incoming.Pos = applied.Pos + len([]rune(applied.Content))
		}
	}

	return incoming
}

func (s *DocumentService) getActiveDocument(documentID string) (*models.OperationCache, error) {
	if document, ok := s.operationCache.Load(documentID); ok {
		doc := document.(*models.OperationCache)
		doc.LastUsed = time.Now()
		return doc, nil
	}

	document := &models.Document{}

	result, err := s.redis.Get(context.Background(), documentID).Result()

	if err == redis.Nil {
		dbResult := s.db.Where("id = ?", documentID).Select("id, title, content, author_id, version, created_at, updated_at").First(document)
		if dbResult.Error != nil {
			return nil, dbResult.Error
		}

		data, err := json.Marshal(document)
		if err != nil {
			return nil, err
		}
		s.redis.Set(context.Background(), documentID, data, 0)
	} else if err != nil {
		return nil, err
	}

	if result != "" {
		err = json.Unmarshal([]byte(result), document)
		if err != nil {
			return nil, err
		}
	}

	ad := &models.OperationCache{
		ActiveDocument: document,
		Operations:     []models.DocumentOperation{},
		LastUsed:       time.Now(),
		Dirty:          false,
	}

	s.operationCache.Store(documentID, ad)
	return ad, nil
}

func (s *DocumentService) getOperationsSince(baseVersion int, documentID uuid.UUID) []models.DocumentOperation {
	cache, ok := s.operationCache.Load(documentID.String())
	if !ok {
		return nil
	}

	doc := cache.(*models.OperationCache)

	operations := []models.DocumentOperation{}
	for _, op := range doc.Operations {
		if op.BaseVersion > baseVersion {
			operations = append(operations, op)
		}
	}

	return operations

}

func (s *DocumentService) saveDocumentToRedis(document *models.Document) error {
	json, err := json.Marshal(document)
	if err != nil {
		return err
	}
	s.redis.Set(context.Background(), document.ID.String(), json, 0)
	return nil
}

func (s *DocumentService) SaveDocumentsToDB() {

	s.operationCache.Range(func(key, value any) bool {
		cache := value.(*models.OperationCache)
		cache.Mu.Lock()
		defer cache.Mu.Unlock()

		if !cache.Dirty {
			return true
		}

		document := cache.ActiveDocument

		err := s.db.Model(&models.Document{}).Where("id = ?", document.ID).Updates(document).Error
		if err != nil {
			log.Printf("Failed to save document to DB: %s %v", document.ID.String(), err)
			return false
		}

		cache.Dirty = false
		cache.LastUsed = time.Now()

		return true
	})

}

func (s *DocumentService) SearchUserForDocument(query string, limit int, documentID string, userID string) ([]models.User, error) {
	users := []models.User{}

	parsedUserID := uuid.MustParse(userID)

	document := &models.Document{}
	s.db.Where("id = ?", documentID).First(document)

	if document.AuthorID != parsedUserID {
		return users, errors.New("you are not authorized to search users for this document")
	}

	userIDs := s.userSearchTrie.SearchUsers(query, limit)

	for _, userID := range userIDs {
		if userID == parsedUserID {
			continue
		}

		user := &models.User{}
		s.db.Where("id = ?", userID).First(user)
		users = append(users, *user)
	}

	return users, nil
}
