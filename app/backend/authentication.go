package main

import (
	"database/sql"
	"encoding/json"
	"io"
	"net/http"
)

func checkUserExists(db *sql.DB, email string) (error, bool) {
	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM Users WHERE email = ?)", email).Scan(&exists)

	if err != nil {
		return err, false
	}

	return nil, exists
}

func createUser(db *sql.DB, user User) error {
	_, err := db.Exec("INSERT INTO USERS (email, password) VALUES(?, ?)", user.Email, user.Password)

	if err != nil {
		return err
	}

	return nil
}

func signUp(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var user User

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = json.Unmarshal(body, &user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err, exists := checkUserExists(db, user.Email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if exists {
		http.Error(w, "Email already used", http.StatusBadRequest)
		return
	}

	err = createUser(db, user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
}
