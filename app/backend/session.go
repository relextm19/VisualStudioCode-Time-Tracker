package main

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
)

type Session struct {
	//Some values can be null thus we use pointers
	ID        string  `json:"id"`
	StartDate string  `json:"startDate"`
	EndDate   *string `json:"endDate"`
	StartTime int64   `json:"startTime"`
	EndTime   *int64  `json:"endTime"`
	Language  string  `json:"language"`
	Project   *string `json:"project"` //for backwards version compatibility when there were no projects
}

func generateSessionID(language string, startTime int64, startDate string) string {
	data := fmt.Sprintf("%s%d%s", language, startTime, startDate)

	hasher := md5.New()
	hasher.Write([]byte(data))

	hash := hasher.Sum(nil)
	return hex.EncodeToString(hash)
}

type SessionSlice struct {
	Sessions []Session
	length   int
}

func (ss *SessionSlice) Push(s Session) {
	ss.Sessions = append(ss.Sessions, s)
	ss.length++
}

func (ss *SessionSlice) AddUnique(s Session) {
	for _, session := range ss.Sessions {
		if session.ID == s.ID {
			return
		}
	}
	ss.length++
	ss.Sessions = append(ss.Sessions, s)
}

func (ss *SessionSlice) Remove(s Session) {
	for i, session := range ss.Sessions {
		if session.ID == s.ID {
			ss.Sessions = append((ss.Sessions)[:i], (ss.Sessions)[i+1:]...)
			return
		}
	}
	ss.length--
}

func (ss *SessionSlice) GetIDByLanguage(language string) (string, error) {
	for _, session := range ss.Sessions {
		if session.Language == language {
			return session.ID, nil
		}
	}
	return "", fmt.Errorf("no session found for language %s", language)
}
