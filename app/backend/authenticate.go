package main

import (
	"database/sql"
	"log"
)

func checkUserExists(db *sql.DB, user_id int) bool {
	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM Users WHERE id = ?)", user_id).Scan(&exists)

	if err != nil {
		log.Printf("User doesnt exist", err)
		return false
	}

	return true
}
