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

var publicPaths = []string{"/login", "/register", "/favicon.ico", "/api/login", "/api/register", "/api/checkAuth"}
var publicPrefixes = []string{"/assets/"}

func checkAuthToken(token string, db *sql.DB) error {
	exists := false
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM WebSessions WHERE webSessionToken = ? AND expiresAt > CAST(strftime('%s', 'now') AS INTEGER))", token).Scan(&exists)
	if err != nil {
		return fmt.Errorf("error quering database for WebsiteSession %s", err)
	}
	if !exists{
		return fmt.Errorf("webSessionToken not correct")
	}
	return nil
}

func checkAuth(r *http.Request, db *sql.DB) error {
	if authToken, err := getAuthToken(r); err != nil{
		return err
	}else{
		return checkAuthToken(authToken, db)
	}
}

func getAuthToken(r *http.Request) (string, error){
	authToken := ""
	if authCookie, err := r.Cookie("WebSessionToken"); err == nil {
		authToken = authCookie.Value
	} else {
		authHeader := r.Header.Get("Authorization")
		authToken = strings.TrimPrefix(authHeader, "Bearer ")
	}
	return authToken, nil
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
		err := checkAuth(r, db)
		if err != nil {
			log.Println("Auth error", err)
			http.Redirect(w, r, "/login", http.StatusFound)
			return
		}

		next.ServeHTTP(w, r)
	})
}
