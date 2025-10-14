package main

import (
	"fmt"
)

type Session struct {
	//Some values can be null thus we use pointers
	SessionID       int     `json:"id"`
	WebSessionToken string  `json:"webSessionToken"`
	StartDate       string  `json:"startDate"`
	EndDate         *string `json:"endDate"`
	StartTime       uint64  `json:"startTime"`
	EndTime         *uint64 `json:"endTime"`
	Language        string  `json:"language"`
	Project         string  `json:"project"`
}

func (s *Session) hasValidFields() error {
	if len(s.Language) < 1 {
		return fmt.Errorf("Language name len has to be greater than 0")
	}
	if len(s.Project) < 1 {
		return fmt.Errorf("Project name len has to be greater than 0")
	}
	if s.StartTime < 1 {
		return fmt.Errorf("Start time has to be more than 0")
	}
	if len(s.StartDate) < 1 {
		return fmt.Errorf("Start date len has to be greater than 0")
	}
	//no need to check the WebSessionToken as its already checked by the middleware
	return nil
}
