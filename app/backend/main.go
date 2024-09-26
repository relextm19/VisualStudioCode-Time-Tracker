package main

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
)

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
