package main

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
	"github.com/rs/cors"
)

func main() {
	db, err := sql.Open("sqlite3", "db/database.db")
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
	router.HandleFunc("/register", func(w http.ResponseWriter, r *http.Request) {
		register(w, r, db)
	}).Methods("POST")
	router.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		login(w, r, db)
	}).Methods("POST")
	router.HandleFunc("/getLanguages", func(w http.ResponseWriter, r *http.Request) {
		getLanguages(w, r, db)
	})
	router.HandleFunc("/getProjects", func(w http.ResponseWriter, r *http.Request) {
		getProjects(w, r, db)
	})

	router.HandleFunc("/projects", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "../static/html/projects.html")
	})
	router.HandleFunc("/languages", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "../static/html/languages.html")
	})

	handler := cors.Default().Handler(router)
	log.Println("server running")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
