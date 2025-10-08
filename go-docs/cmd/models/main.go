package models

import (
	"sync"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	Name      string    `gorm:"not null; default:''; index"`
	Email     string    `gorm:"uniqueIndex"`
	Password  string    `gorm:"not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

type Document struct {
	ID           uuid.UUID              `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	Title        string                 `gorm:"not null"`
	Content      string                 `gorm:"not null"`
	AuthorID     uuid.UUID              `gorm:"not null"`
	Author       User                   `gorm:"foreignKey:AuthorID"`
	Version      int                    `gorm:"not null default 0"`
	Collaborator []DocumentCollaborator `gorm:"foreignKey:DocumentID"`
	CreatedAt    time.Time              `gorm:"autoCreateTime"`
	UpdatedAt    time.Time              `gorm:"autoUpdateTime"`
}

type DocumentCollaborator struct {
	ID         uuid.UUID   `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	DocumentID uuid.UUID   `gorm:"not null"`
	Document   Document    `gorm:"foreignKey:DocumentID"`
	UserID     uuid.UUID   `gorm:"not null"`
	User       User        `gorm:"foreignKey:UserID"`
	Access     AccessLevel `gorm:"not null"`
	CreatedAt  time.Time   `gorm:"autoCreateTime"`
	UpdatedAt  time.Time   `gorm:"autoUpdateTime"`
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
	ID            uuid.UUID
	DocumentID    uuid.UUID
	UserID        uuid.UUID
	OperationType OperationType
	Content       string
	Pos           int
	DeleteLen     int
	BaseVersion   int
	Timestamp     time.Time
}

type OperationCache struct {
	Operations     []DocumentOperation
	LastUsed       time.Time
	ActiveDocument *Document
	Dirty          bool
	Mu             sync.Mutex
}
