package main

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"log"
)

type Session struct {
	ID        string `json:"id"`
	StartDate string `json:"startDate"`
	EndDate   string `json:"endDate"`
	StartTime int64  `json:"startTime"`
	EndTime   int64  `json:"endTime"`
	Language  string `json:"language"`
	Project   string `json:"project"`
}

func generateSessionID(language string, startTime int64, startDate string) string {
	data := fmt.Sprintf("%s%d%s", language, startTime, startDate)

	hasher := md5.New()
	hasher.Write([]byte(data))

	hash := hasher.Sum(nil)
	log.Println(hex.EncodeToString(hash))
	return hex.EncodeToString(hash)
}

type SessionSlice []Session

func (ls *SessionSlice) AddUnique(s Session) {
	for _, session := range *ls {
		if session.ID == s.ID {
			return
		}
	}
	*ls = append(*ls, s)
}

func (ls *SessionSlice) Remove(s Session) {
	for i, session := range *ls {
		if session.ID == s.ID {
			*ls = append((*ls)[:i], (*ls)[i+1:]...)
			return
		}
	}
}

func (ls *SessionSlice) GetIDByLanguage(language string) (string, error) {
	for _, session := range *ls {
		if session.Language == language {
			return session.ID, nil
		}
	}
	return "", fmt.Errorf("no session found for language %s", language)
}
