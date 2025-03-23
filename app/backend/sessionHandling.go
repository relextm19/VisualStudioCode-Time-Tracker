package main

import (
	"database/sql"
	"encoding/json"
	"io"
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

	_, err = db.Exec("INSERT INTO Sessions (id, startDate, endDate, startTime, endTime, language, project) VALUES (?, ?, ?, ?, ?, ?, ?)",
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

	_, err = db.Exec("UPDATE Sessions SET endDate = ?, endTime = ? WHERE id = ?",
		session.EndDate, session.EndTime, session.ID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

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
