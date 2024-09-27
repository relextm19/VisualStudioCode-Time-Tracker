package main

import (
	"database/sql"
	"fmt"
)

func mapData(key string, db *sql.DB) (map[string]uint64, error) {
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
