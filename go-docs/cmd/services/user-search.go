package services

import (
	"go-docs/cmd/models"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRecordTrieNode struct {
	children map[rune]*UserRecordTrieNode
	userIDs  []uuid.UUID
}

type UserSearchService struct {
	root *UserRecordTrieNode
}

func NewUserSearchService() *UserSearchService {
	return &UserSearchService{root: &UserRecordTrieNode{children: make(map[rune]*UserRecordTrieNode), userIDs: make([]uuid.UUID, 0)}}
}

func (s *UserSearchService) AddUser(user models.UserRecord) {
	node := s.root
	email := strings.ToLower(user.Email)

	for _, char := range email {
		if _, ok := node.children[char]; !ok {
			node.children[char] = &UserRecordTrieNode{
				children: make(map[rune]*UserRecordTrieNode),
				userIDs:  make([]uuid.UUID, 0),
			}
		}
		node = node.children[char]
		node.userIDs = append(node.userIDs, user.UserID)
	}
}

func (s *UserSearchService) SearchUsers(query string, limit int) []uuid.UUID {

	node := s.root
	query = strings.ToLower(query)

	for _, char := range query {
		if _, ok := node.children[char]; !ok {
			return []uuid.UUID{}
		}

		node = node.children[char]
	}
	if len(node.userIDs) <= limit {
		return node.userIDs
	}

	return node.userIDs[:limit]
}

func PushUsersToTrie(db *gorm.DB) *UserSearchService {
	users := []models.User{}

	err := db.Find(&users).Error

	trie := NewUserSearchService()
	if err != nil {
		return trie
	}

	for _, user := range users {
		trie.AddUser(
			models.UserRecord{
				UserID: user.ID,
				Email:  user.Email,
			},
		)
	}

	return trie
}
