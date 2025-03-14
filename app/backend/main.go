package main

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	db, err := sql.Open("sqlite3", "db/database_copy.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	router := mux.NewRouter()
	router.Use(corsMiddleware)

	router.HandleFunc("/startSession", func(w http.ResponseWriter, r *http.Request) {
		log.Println("start Session")
		startSession(w, r, db)
	}).Methods("POST")
	router.HandleFunc("/endSession", func(w http.ResponseWriter, r *http.Request) {
		log.Println("end Session")
		endSession(w, r, db)
	}).Methods("POST")
	router.HandleFunc("/getLanguages", func(w http.ResponseWriter, r *http.Request) {
		log.Println("get languages")
		getLanguages(w, r, db)
	})
	router.HandleFunc("/getProjects", func(w http.ResponseWriter, r *http.Request) {
		log.Println("get projects")
		getProjects(w, r, db)
	})
	router.HandleFunc("/projects", func(w http.ResponseWriter, r *http.Request) {
		log.Println("projects")
		http.ServeFile(w, r, "../static/html/projects.html")
	})
	router.HandleFunc("/languages", func(w http.ResponseWriter, r *http.Request) {
		log.Println("languages")
		http.ServeFile(w, r, "../static/html/languages.html")
	})

	router.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("../static"))))

	log.Fatal(http.ListenAndServe(":8080", router))
}
