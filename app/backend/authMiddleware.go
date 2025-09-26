package main

import (
	"database/sql"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"net/http"
	"slices"
)

var publicPaths []string = []string{"/login", "/register"}

func checkAuth(r *http.Request, db *sql.DB) (bool, error) {
	authCookie, err := r.Cookie("WebSessionToken")
	if err != nil {
		log.Println("Error reading authCookie from request")
		return false, err
	}
	return checkAuthToken(authCookie.Value, db)
}

func checkAuthToken(token string, db *sql.DB) (bool, error) {
	exists := false
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM WebSessions WHERE webSessionToken = ?)", token).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("error quering database for WebsiteSession %s", err)
	}
	return exists, nil
}

func AuthMiddleware(next http.Handler, db *sql.DB) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if slices.Contains(publicPaths, r.URL.Path) {
			next.ServeHTTP(w, r)
			return
		}

		loggedIn, err := checkAuth(r, db)
		if err != nil {
			log.Println("Auth error", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		if !loggedIn {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}
