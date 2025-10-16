package main

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"net/http"
	"time"
)

func mapData(db *sql.DB, userID string) ([]map[string]uint64, error) { //here we collect the time based on languages/projects
	rows, err := db.Query("SELECT language, project, endTime - startTime FROM Sessions WHERE userID = ? AND endTime NOT NULL", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	projects := make(map[string]uint64)
	languages := make(map[string]uint64)

	for rows.Next() {
		var deltaTime uint64
		var language, project string

		if err := rows.Scan(&language, &project, &deltaTime); err != nil {
			return nil, err
		}

		projects[project] += deltaTime
		languages[language] += deltaTime
	}

	//check for errors during iteration
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return []map[string]uint64{projects, languages}, nil
}

// return a 256-bit random token
func generateID() (string, error) {
	b := make([]byte, 32)

	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}

	return hex.EncodeToString(b), nil
}

func getCurrentDateTime() (string, uint64) {
	now := time.Now()
	date := now.Format("2006-01-02")
	timeUnix := uint64(now.Unix())

	return date, timeUnix
}

func generateCookie(token string, exprDate time.Time) (http.Cookie, error) {
	if len(token) < 1 {
		return http.Cookie{}, fmt.Errorf("Cant create cookie the token is not present")
	}
	return http.Cookie{
		Name:     "WebSessionToken",
		Value:    token,
		Expires:  exprDate,
		SameSite: http.SameSiteLaxMode,
		Secure:   false,
		Path:     "/",
	}, nil
}
