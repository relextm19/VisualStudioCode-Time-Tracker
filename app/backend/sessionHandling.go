package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

var openSessions = make(map[string]int) // cash open sessions to deload the database, map WebSessionToken to a SessionID

func startSession(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var session Session

	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println("Error reading request body")
		return
	}
	err = json.Unmarshal(body, &session)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println("Error during unmarshal")
		return
	}
	authHeader := r.Header.Get("Authorization")
	session.WebSessionToken = strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))

	session.StartDate, session.StartTime = getCurrentDateTime()
	if err = session.hasValidFields(); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Println(err)
		return
	}

	userID, err := getUserIDFromWebSessionToken(db, session.WebSessionToken)
	if err != nil{
		fmt.Println("Error getting userID from webSessionToken,", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	res, err := db.Exec(
		"INSERT INTO Sessions (userID, language, project, startTime, startDate, endTime, endDate) "+
			"VALUES (?, ?, ?, ?, ?, ?, ?)",
		userID, session.Language, session.Project,
		session.StartTime, session.StartDate, nil, nil)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println("Error adding session to database", err)
		return
	}
	if id, err := res.LastInsertId(); err != nil {
		log.Println("Error retieving last inser id", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	} else {
		authHeader := r.Header.Get("Authorization")
		webSessionToken := strings.TrimPrefix(authHeader, "Bearer ")
		openSessions[webSessionToken] = int(id)
	}

	log.Printf("Session started in %s, project %s", session.Language, session.Project)
	w.WriteHeader(http.StatusOK)
}

func endSession(webSessionToken string, db *sql.DB) error {
	endDate, endTime := getCurrentDateTime()
	var sessionID int
	sessionID, ok := openSessions[webSessionToken]
	// if we dont have the sessionID cashed retieve it from the database
	if !ok {
		err := db.QueryRow("SELECT sessionID FROM Sessions WHERE userID = (SELECT userID FROM WebSessions WHERE webSessionToken = ?) AND endTime IS NULL LIMIT 1", webSessionToken).Scan(&sessionID)
		if err != nil {
			return fmt.Errorf("error retrieving sessionID for WebSessionToken: %s, %s", webSessionToken, err)
		}
	}
	_, err := db.Exec("UPDATE Sessions SET endDate = ?, endTime = ? WHERE sessionID = ?",
		endDate, endTime, sessionID)

	if err != nil {
		return fmt.Errorf("error ending session %s", err)
	}

	delete(openSessions, webSessionToken)
	return nil
}

func endSessionHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var session Session

	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Println("Error reading request body")
		return
	}

	err = json.Unmarshal(body, &session)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Println("Error during unmarshal", err)
		return
	}

	authHeader := r.Header.Get("Authorization")
	webSessionToken := strings.TrimPrefix(authHeader, "Bearer ")

	if err = endSession(webSessionToken, db); err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	log.Printf("Session ended in %s, project %s", session.Language, session.Project)
	w.WriteHeader(http.StatusOK)
}

func getUserMetrics(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	webSessionToken, err := getAuthToken(r) //getAuthToken checks both cookies and the request header
	if err != nil{
		log.Println("Error retrieving the auth token", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	userID, err := getUserIDFromWebSessionToken(db, webSessionToken)
	if err != nil {
		log.Println("Error getting userID from WebSessionToken: ", err, webSessionToken)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	mappedData, err := mapData(db, userID)
	if err != nil {
		log.Println("Errpr fetching user metrics: ", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	b, err := json.Marshal(mappedData)
	if err != nil{
		log.Println("Error marshaling data", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(b)
}
