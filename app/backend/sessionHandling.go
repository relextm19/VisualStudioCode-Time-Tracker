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
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = json.Unmarshal(body, &session)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	session.ID = generateSessionID(session.Language, session.StartTime, session.StartDate)

	_, err = db.Exec("INSERT INTO sessions (id, startDate, endDate, startTime, endTime, language, project) VALUES (?, ?, ?, ?, ?, ?, ?)",
		session.ID, session.StartDate, session.EndDate, session.StartTime, session.EndTime, session.Language, session.Project)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	openSessions.AddUnique(session)
	w.WriteHeader(http.StatusOK)
}

func endSession(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var session Session

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Println(string(body))

	err = json.Unmarshal(body, &session)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	session.ID, err = openSessions.GetIDByLanguage(session.Language)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err = db.Exec("UPDATE sessions SET endDate = ?, endTime = ? WHERE id = ?",
		session.EndDate, session.EndTime, session.ID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	openSessions.Remove(session)
	w.WriteHeader(http.StatusOK)
}
