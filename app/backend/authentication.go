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
	_, err := db.Exec("INSERT INTO USERS (userID, email, password) VALUES(?, ?, ?)", user.UserID, user.Email, user.Password)

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
	generatedID, err := generateID()
	if err != nil {
		log.Println("Error generating user ID:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	user.UserID = generatedID

	err = createUser(db, user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println("Error creating user", err)
		return
	}

	webSessionCookie, err := setHeaderAndCookie(&w)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = createNewWebSession(db, webSessionCookie.Value, user.UserID, webSessionCookie.Expires.Unix())
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	response := map[string]string{"WebSessionToken": webSessionCookie.Value}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println("Failed to encode response:", err)
		return
	}
	log.Println("User registered successfully. returned", webSessionCookie.Value)
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
		err := db.QueryRow("SELECT userID FROM Users WHERE email = ? AND password = ?", user.Email, user.Password).Scan(&user.UserID)
		if err != nil {
			log.Println("Error querying user:", err)
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		if user.UserID != "" {
			webSessionCookie, err := setHeaderAndCookie(&w)
			if err != nil {
				log.Println(err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			err = createNewWebSession(db, webSessionCookie.Value, user.UserID, webSessionCookie.Expires.Unix())
			if err != nil {
				log.Println(err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			response := map[string]string{"WebSessionToken": webSessionCookie.Value}
			if err := json.NewEncoder(w).Encode(response); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				log.Println("Failed to encode response:", err)
				return
			}
			log.Println("User logged in successfully returned", webSessionCookie.Value)
		} else {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
	} else {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
}

func setHeaderAndCookie(w *http.ResponseWriter) (*http.Cookie, error) {
	//first generate the cookie
	exprDate := time.Now().Add(time.Hour * 720) //30 days
	token, err := generateID()
	if err != nil {
		return nil, fmt.Errorf("error generating an uth token %s", err)
	}
	sessionTokenCookie := generateWebSessionTokenCookie(token, exprDate)
	//set the headers and cookie header
	(*w).Header().Set("Content-Type", "application/json")
	http.SetCookie(*w, &sessionTokenCookie)

	return &sessionTokenCookie, nil
}

func createNewWebSession(db *sql.DB, sessionToken string, userID string, expiresAt int64) error {
	_, err := db.Exec("INSERT INTO WebSessions (webSessionToken, userID, expiresAt) VALUES(?, ?, ?)", sessionToken, userID, expiresAt)
	if err != nil {
		return fmt.Errorf("error inserting new web session %s", err)
	}
	return nil
}
