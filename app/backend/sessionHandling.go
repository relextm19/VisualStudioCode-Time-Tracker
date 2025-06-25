package main

import (
	"database/sql"
	"encoding/json"
	"io"
	"log"
	"net/http"
)

var openSessions SessionSlice

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

	session.StartDate, session.StartTime = getCurrentDateTime()
	//we take in an WebSessionToken to identfy the user without exposing the user ID and to expire the tokens but in the database its saved with the user ID
	result, err := db.Exec(
		"INSERT INTO Sessions (userID, language, project, startTime, startDate, endTime, endDate) "+
			"VALUES ((SELECT userID FROM WebSessions WHERE webSessionToken = ?), ?, ?, ?, ?, ?, ?)",
		session.WebSessionToken, session.Language, session.Project,
		session.StartTime, session.StartDate, nil, nil)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println("Error adding session to database", err)
		return
	}

	sessionID, err := result.LastInsertId()
	if err != nil {
		log.Println("Error retrieving last id", err)
	}

	session.SessionID = sessionID

	err = openSessions.AddUnique(session)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println("Error adding session to open sessions", err)
		return
	}

	log.Printf("Session started in %s, project %s", session.Language, session.Project)
	w.WriteHeader(http.StatusOK)
}

func endSession(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var session Session

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println("Error reading request body")
		return
	}

	err = json.Unmarshal(body, &session)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println("Error during unmarshal", err)
		return
	}

	session.SessionID, err = openSessions.GetSessionIDForUser(session.WebSessionToken)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println("Could not find session for sessionToken", session.WebSessionToken)
		return
	}

	// Get current date and time. We have to use temp variables because of type mismatch
	endDate, endTimeValue := getCurrentDateTime()

	// Store as pointers in the session
	session.EndDate = &endDate
	session.EndTime = &endTimeValue

	_, err = db.Exec("UPDATE Sessions SET endDate = ?, endTime = ? WHERE sessionID = ?",
		session.EndDate, session.EndTime, session.SessionID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println("Error updating session in database", err)
		return
	}

	log.Printf("Session ended in %s, projects %s", session.Language, session.Project)
	openSessions.Remove(session)
	w.WriteHeader(http.StatusOK)
}

func getLanguages(w http.ResponseWriter, _ *http.Request, db *sql.DB) {
	totalTimes, err := mapData("language", db)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(totalTimes); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func getProjects(w http.ResponseWriter, _ *http.Request, db *sql.DB) {
	totalTimes, err := mapData("project", db)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(totalTimes); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
