package main

import (
	"fmt"
)

type Session struct {
	//Some values can be null thus we use pointers
	SessionID string  `json:"id"`
	UserID    string  `json:"userId"`
	StartDate string  `json:"startDate"`
	EndDate   *string `json:"endDate"`
	StartTime uint64  `json:"startTime"`
	EndTime   *uint64 `json:"endTime"`
	Language  string  `json:"language"`
	Project   string  `json:"project"`
}

func (s *Session) hasValidFields() bool {
	if len(s.Language) <= 0 {
		return false
	}
	if len(s.Project) <= 0 {
		return false
	}
	if s.StartTime <= 0 {
		return false
	}
	if s.UserID == "" {
		return false
	}
	return true
}

type SessionSlice struct {
	Sessions []Session //i could use a map but there are little enough sessions that a slice is fine
	length   int
}

func (ss *SessionSlice) Push(s Session) {
	ss.Sessions = append(ss.Sessions, s)
	ss.length++
}

func (ss *SessionSlice) AddUnique(s Session) {
	for _, session := range ss.Sessions {
		if session.SessionID == s.SessionID {
			return
		}
	}
	ss.length++
	ss.Sessions = append(ss.Sessions, s)
}

func (ss *SessionSlice) Remove(s Session) {
	for i, session := range ss.Sessions {
		if session.SessionID == s.SessionID {
			ss.Sessions = append((ss.Sessions)[:i], (ss.Sessions)[i+1:]...)
			return
		}
	}
	ss.length--
}

func (ss *SessionSlice) GetIDByLanguage(language string) (string, error) {
	for _, session := range ss.Sessions {
		if session.Language == language {
			return session.SessionID, nil
		}
	}
	return "", fmt.Errorf("no session found for language %s", language)
}
