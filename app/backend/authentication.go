package main

import (
	"database/sql"
	"encoding/json"
	"io"
	"log"
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

// FIXME: empty user is a valid user
func register(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var user User

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request", http.StatusBadRequest)
		log.Println("Error reading request")
		return
	}

	err = json.Unmarshal(body, &user)
	if err != nil {
		http.Error(w, "Invalid request format", http.StatusBadRequest)
		log.Println("Invalid request format")
		return
	}

	err, exists := checkUserExists(db, user.Email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println("Error checking user existence")
		return
	}
	if exists {
		http.Error(w, "Email already used", http.StatusBadRequest)
		log.Println("Email already used")
		return
	}

	err = createUser(db, user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println("Error creating user")
	}
	log.Println("User registered")
}

func login(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var user User

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	err = json.Unmarshal(body, &user)
	if err != nil {
		http.Error(w, "Invalid request format", http.StatusBadRequest)
	}

	var exists bool
	err, exists = checkUserExists(db, user.Email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if exists {
		var match bool
		err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM Users WHERE email = ? AND password = ?)", user.Email, user.Password).Scan(&match)
		if err != nil {
			http.Error(w, "Failed to look up user", http.StatusBadRequest)
		}
		if match {
			w.WriteHeader(http.StatusAccepted)
		} else {
			w.WriteHeader(http.StatusUnauthorized)
		}
	} else {
		http.Error(w, "User doesnt exist", http.StatusBadRequest)
		return
	}
}
