package models

import (
	"sync"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Name      string    `gorm:"not null; default:''; index" json:"name"`
	Email     string    `gorm:"uniqueIndex" json:"email"`
	Password  string    `gorm:"not null" json:"-"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

type Document struct {
	ID           uuid.UUID              `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Title        string                 `gorm:"not null" json:"title"`
	Content      string                 `gorm:"not null" json:"content"`
	AuthorID     uuid.UUID              `gorm:"not null" json:"author_id"`
	Author       User                   `gorm:"foreignKey:AuthorID" json:"author"`
	Version      int                    `gorm:"not null default 0" json:"version"`
	Collaborator []DocumentCollaborator `gorm:"foreignKey:DocumentID" json:"collaborators"`
	CreatedAt    time.Time              `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time              `gorm:"autoUpdateTime" json:"updated_at"`
}

type DocumentCollaborator struct {
	ID         uuid.UUID   `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	DocumentID uuid.UUID   `gorm:"not null" json:"document_id"`
	Document   Document    `gorm:"foreignKey:DocumentID" json:"document"`
	UserID     uuid.UUID   `gorm:"not null" json:"user_id"`
	User       User        `gorm:"foreignKey:UserID" json:"user"`
	Access     AccessLevel `gorm:"not null" json:"access"`
	CreatedAt  time.Time   `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time   `gorm:"autoUpdateTime" json:"updated_at"`
}

const (
	AccessLevelRead  AccessLevel = "read"
	AccessLevelWrite AccessLevel = "write"
)

type AccessLevel string

type OperationType string

const (
	OperationTypeInsert  OperationType = "insert"
	OperationTypeReplace OperationType = "replace"
	OperationTypeDelete  OperationType = "delete"
)

// Not storing in db, will add later if needed
type DocumentOperation struct {
	ID            uuid.UUID     `json:"id"`
	DocumentID    uuid.UUID     `json:"document_id"`
	UserID        uuid.UUID     `json:"user_id"`
	OperationType OperationType `json:"operation_type"`
	Content       string        `json:"content"`
	Pos           int           `json:"pos"`
	DeleteLen     int           `json:"delete_len"`
	BaseVersion   int           `json:"base_version"`
	Timestamp     time.Time     `json:"timestamp"`
}

type OperationCache struct {
	Operations     []DocumentOperation
	LastUsed       time.Time
	ActiveDocument *Document
	Dirty          bool
	Mu             sync.Mutex
}

type UserRecord struct {
	UserID uuid.UUID
	Email  string
}
