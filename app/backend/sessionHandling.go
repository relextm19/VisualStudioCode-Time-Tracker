package main

import (
	"database/sql"
	"encoding/json"
	"io"
	"log"
	"net/http"
)

//TODO: Add a user token to the session to identify the user

var openSessions SessionSlice

func startSession(w http.ResponseWriter, r *http.Request, db *sql.DB) {
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
		log.Println("Error during unmarshal")
		return
	}

	session.SessionID, err = generateID()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println("Error generating session ID")
		return
	}

	session.StartDate, session.StartTime = getCurrentDateTime()

	log.Printf("language: %s, project: %s, startDate: %s, startTime: %d, userID: %s, sessionID: %s", session.Language, session.Project, session.StartDate, session.StartTime, session.UserID, session.SessionID)
	_, err = db.Exec("INSERT INTO Sessions (session_id, user_id, language, project, startTime, startDate, endTime, endDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		session.SessionID, session.UserID, session.Language, session.Project,
		session.StartTime, session.StartDate, nil, nil)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println("Error adding session to database", err)
		return
	}

	log.Printf("Session started in %s, projects %s", session.Language, session.Project)
	openSessions.AddUnique(session)
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
		log.Println("Error during unmarshal")
		return
	}

	session.SessionID, err = openSessions.GetIDByLanguage(session.Language)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println("Error during db lookup")
		return
	}

	// Get current date and time. We have to use temp variables because of type mismatch
	endDate, endTimeValue := getCurrentDateTime()

	// Store as pointers in the session
	session.EndDate = &endDate
	session.EndTime = &endTimeValue

	_, err = db.Exec("UPDATE Sessions SET endDate = ?, endTime = ? WHERE id = ?",
		session.EndDate, session.EndTime, session.SessionID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println("Error updating session in database")
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
