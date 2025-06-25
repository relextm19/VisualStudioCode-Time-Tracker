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
	"github.com/rs/cors"
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
	distDir := "../frontend/site/dist"
	router.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Only handle non-API paths
		if strings.HasPrefix(r.URL.Path, "/api/") {
			return
		}

		//prevent directory traversal attacks
		cleanedPath := filepath.Clean(r.URL.Path)
		fullPath := filepath.Join(distDir, cleanedPath)

		absDistDir, _ := filepath.Abs(distDir)
		absFullPath, _ := filepath.Abs(fullPath)
		if !strings.HasPrefix(absFullPath, absDistDir) {
			http.Error(w, "Invalid path", http.StatusBadRequest)
			return
		}
		log.Println(r.URL.Path, "->", fullPath)
		_, err := os.Stat(fullPath)
		if err == nil {
			http.ServeFile(w, r, fullPath)
			return
		}
		http.ServeFile(w, r, filepath.Join(distDir, "index.html"))
	})

	cors := cors.New(cors.Options{
		AllowedOrigins:   []string{"127.0.0.1:5173"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
	})

	log.Fatal(http.ListenAndServe(":8080", cors.Handler(router)))
}
