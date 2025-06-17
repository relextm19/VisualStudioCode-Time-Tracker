package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

func checkUserExists(db *sql.DB, email string) (error, bool) {
	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM Users WHERE email = ?)", email).Scan(&exists)

	if err != nil {
		return fmt.Errorf("error looking for user in db %s", err), false
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
		w.WriteHeader(http.StatusBadRequest)
		log.Println("Error reading request")
		return
	}

	err = json.Unmarshal(body, &user)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Println("Invalid request format")
		return
	}

	if !user.hasValidFields() {
		w.WriteHeader(http.StatusBadRequest)
		log.Println("User is missing password or email")
		return
	}

	err, exists := checkUserExists(db, user.Email)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Println("Error checking user existence")
		return
	}

	if exists {
		w.WriteHeader(http.StatusBadRequest)
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
		w.WriteHeader(http.StatusInternalServerError)
		log.Println("Error creating user")
		return
	}

	err = setHeaderAndCookie(&w)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	response := map[string]string{"user_id": user_id}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println("Failed to encode response:", err)
		return
	}
	log.Println("User registered successfully")
}

func login(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var user User

	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println("error body read", err)
		return
	}
	err = json.Unmarshal(body, &user)
	if err != nil {
		log.Println(string(body))
		w.WriteHeader(http.StatusBadRequest)
		log.Println("error during unmarshal", err)
		return
	}

	var exists bool
	err, exists = checkUserExists(db, user.Email)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Println(err)
		return
	}
	if exists {
		user_id := ""
		err := db.QueryRow("SELECT user_id FROM Users WHERE email = ? AND password = ?", user.Email, user.Password).Scan(&user_id)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		if user_id != "" {
			err := setHeaderAndCookie(&w)
			if err != nil {
				log.Println(err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			response := map[string]string{"user_id": user_id}
			if err := json.NewEncoder(w).Encode(response); err != nil {
				http.Error(w, "Failed to encode response", http.StatusInternalServerError)
				log.Println("Failed to encode response:", err)
				return
			}
			log.Println(w.Header(), response)
			log.Println("User logged in successfully")
		} else {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
	} else {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
}

func setHeaderAndCookie(w *http.ResponseWriter) error {
	//first generate the cookie
	exprDate := time.Now().Add(time.Hour * 720) //30 days
	token, err := generateID()
	if err != nil {
		return fmt.Errorf("error generating an uth token %s", err)
	}
	authCookie := generateAuthCookie(token, exprDate)
	//set the headers and cookie header
	(*w).Header().Set("Content-Type", "application/json")
	http.SetCookie(*w, &authCookie)

	return nil
}

func checkAuth(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	log.Println(r.Cookies())
	authCookie, err := r.Cookie("AuthToken")
	if err != nil {
		log.Println("Error reading authCookie from request")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	loggedIn, err := checkAuthToken(authCookie.Value, db)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if loggedIn {
		w.WriteHeader(http.StatusOK)
		return
	} else {
		w.WriteHeader(http.StatusUnauthorized)
	}

}

func checkAuthToken(token string, db *sql.DB) (bool, error) {
	exists := false
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM WebsiteSessions WHERE sessionToken = ?)", token).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("error quering database for WebsiteSession %s", err)
	}
	return exists, nil
}
