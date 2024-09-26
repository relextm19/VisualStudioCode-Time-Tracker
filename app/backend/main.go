package main

import (
	"database/sql"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
)

var openSessions SessionSlice

func main() {
	db, err := sql.Open("sqlite3", "../db/database_copy.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	router := mux.NewRouter()
	router.HandleFunc("/startSession", func(w http.ResponseWriter, r *http.Request) {
		startSession(w, r, db)
	}).Methods("POST")
	router.HandleFunc("/endSession", func(w http.ResponseWriter, r *http.Request) {
		endSession(w, r, db)
	}).Methods("POST")

	log.Fatal(http.ListenAndServe(":5000", router))
}

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
