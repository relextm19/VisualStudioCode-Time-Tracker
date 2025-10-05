package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"slices"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

var publicPaths = []string{"/login", "/register", "/favicon.ico", "/api/login", "/api/register"}
var publicPrefixes = []string{"/assets/"}

func checkAuthToken(token string, db *sql.DB) (bool, error) {
	exists := false
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM WebSessions WHERE webSessionToken = ?)", token).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("error quering database for WebsiteSession %s", err)
	}
	return exists, nil
}

func checkAuth(r *http.Request, db *sql.DB) (bool, error) {
	authToken := ""
	fmt.Println(r.Cookies())
	if authCookie, err := r.Cookie("WebSessionToken"); err == nil {
		authToken = authCookie.Value
	} else {
		fmt.Println(r.Header)
		authHeader := r.Header.Get("Authorization")
		authToken = strings.TrimPrefix(authHeader, "Bearer ")
	}

	if authToken == "" {
		return false, nil
	}
	return checkAuthToken(authToken, db)
}

func AuthMiddleware(next http.Handler, db *sql.DB) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		//check if path is publicly accesible
		if slices.Contains(publicPaths, r.URL.Path) {
			next.ServeHTTP(w, r)
			return
		}
		//check if path has a publicly accesible prefix
		for _, prefix := range publicPrefixes {
			if strings.HasPrefix(r.URL.Path, prefix) {
				next.ServeHTTP(w, r)
				return
			}
		}
		loggedIn, err := checkAuth(r, db)
		if err != nil {
			log.Println("Auth error", err)
			http.Redirect(w, r, "/login", http.StatusFound)
			return
		}
		if !loggedIn {
			http.Redirect(w, r, "/login", http.StatusFound)
			return
		}

		next.ServeHTTP(w, r)
	})
}
