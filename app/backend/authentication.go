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
		http.Error(w, "Error reading request", http.StatusBadRequest)
		return
	}

	err = json.Unmarshal(body, &user)
	if err != nil {
		http.Error(w, "Invalid request format", http.StatusBadRequest)
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

func checkUserExistsEndpoint(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var requestBody map[string]string

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}

	err = json.Unmarshal(body, &requestBody)
	if err != nil {
		http.Error(w, "Invalid request format", http.StatusBadRequest)
		return
	}

	// Extract the email from the map
	email, ok := requestBody["email"]
	if !ok || email == "" {
		http.Error(w, "Email is required", http.StatusBadRequest)
		return
	}

	err, exists := checkUserExists(db, email)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if exists {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"exists": true}`))
	} else {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"exists": false}`))
	}
}
