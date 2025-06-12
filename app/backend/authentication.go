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
	_, err := db.Exec("INSERT INTO USERS (user_id, email, password) VALUES(?, ?, ?)", user.ID, user.Email, user.Password)

	if err != nil {
		return err
	}

	return nil
}

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

	if !user.hasValidFields() {
		http.Error(w, "User is missing password or email", http.StatusBadRequest)
		log.Println("User is missing password or email")
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

	//generate a unique user ID
	user_id, err := generateID()
	if err != nil {
		log.Println("Error generating user ID:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	user.ID = user_id

	err = createUser(db, user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println("Error creating user")
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{"user_id": user_id}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		log.Println("Failed to encode response:", err)
		return
	}
	log.Println("User registered successfully")
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
		user_id := ""
		err := db.QueryRow("SELECT user_id FROM Users WHERE email = ? AND password = ?", user.Email, user.Password).Scan(&user_id)
		if err != nil {
			http.Error(w, "Failed to look up user", http.StatusBadRequest)
		}
		if user_id != "" {
			w.WriteHeader(http.StatusAccepted)
			w.Header().Set("Content-Type", "application/json")
			response := map[string]string{"user_id": user_id}
			if err := json.NewEncoder(w).Encode(response); err != nil {
				http.Error(w, "Failed to encode response", http.StatusInternalServerError)
				log.Println("Failed to encode response:", err)
				return
			}
			log.Println("User logged in successfully")
		} else {
			w.WriteHeader(http.StatusUnauthorized)
		}
	} else {
		http.Error(w, "User doesnt exist", http.StatusBadRequest)
		return
	}
}
