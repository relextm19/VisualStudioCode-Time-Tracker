package main

import (
	"database/sql"
	"fmt"
	"net/http"
)

func mapData(key string, db *sql.DB) (map[string]uint64, error) { //here we collect the time based on languages
	rows, err := db.Query(fmt.Sprintf("SELECT %s, startTime, endTime FROM Sessions", key))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	totalTimes := make(map[string]uint64)

	for rows.Next() {
		var startTime uint64
		var endTime *uint64
		var language string

		if err := rows.Scan(&language, &startTime, &endTime); err != nil {
			return nil, err
		}
		// log.Println(startTime, *endTime, language)

		if endTime != nil && *endTime > startTime {
			duration := *endTime - startTime
			totalTimes[language] += duration
		}
	}

	//check for errors during iteration
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return totalTimes, nil
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w)
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}
