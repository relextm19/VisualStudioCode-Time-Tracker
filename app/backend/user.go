package main

import (
	"database/sql"
	"log"
)

type User struct {
	UserID   string `json:"userID"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (u *User) hasValidFields() bool {
	if len(u.Email) <= 0 {
		log.Println("User has no email")
		return false
	}
	if len(u.Password) <= 0 {
		log.Println("User has no password")
		return false
	}
	return true
}

func getUserIDFromWebSessionToken(db *sql.DB, webSessionToken string) (string, error) {
	var userID string
	err := db.QueryRow("SELECT userID FROM WebSessions WHERE webSessionToken = ?", webSessionToken).Scan(&userID)
	if err != nil {
		return "", err
	}
	return userID, nil
}
