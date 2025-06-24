package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	db, err := sql.Open("sqlite3", "db/database.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	router := mux.NewRouter()

	router.HandleFunc("/api/startSession", func(w http.ResponseWriter, r *http.Request) {
		startSession(w, r, db)
	}).Methods("POST")
	router.HandleFunc("/api/endSession", func(w http.ResponseWriter, r *http.Request) {
		endSession(w, r, db)
	}).Methods("POST")
	router.HandleFunc("/api/register", func(w http.ResponseWriter, r *http.Request) {
		register(w, r, db)
	}).Methods("POST")
	router.HandleFunc("/api/login", func(w http.ResponseWriter, r *http.Request) {
		login(w, r, db)
	}).Methods("POST")
	router.HandleFunc("/api/authorized", func(w http.ResponseWriter, r *http.Request) {
		checkAuth(w, r, db)
	})
	router.HandleFunc("/api/getLanguages", func(w http.ResponseWriter, r *http.Request) {
		getLanguages(w, r, db)
	})
	router.HandleFunc("/api/getProjects", func(w http.ResponseWriter, r *http.Request) {
		getProjects(w, r, db)
	})

	//serve the frontend files
	//FIXME: This is absolutely not safe the input needs to be sanitized or sth similar
	distDir := "../frontend/site/dist"
	router.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Only handle non-API paths
		if strings.HasPrefix(r.URL.Path, "/api/") {
			return
		}
		path := filepath.Join(distDir, r.URL.Path)
		_, err := os.Stat(path)
		if err == nil {
			http.ServeFile(w, r, path)
			return
		}
		http.ServeFile(w, r, filepath.Join(distDir, "index.html"))
	})

	log.Fatal(http.ListenAndServe(":8080", router))
}
