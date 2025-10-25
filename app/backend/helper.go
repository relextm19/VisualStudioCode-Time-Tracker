package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"time"
)

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
		return http.Cookie{}, fmt.Errorf("cant create cookie the token is not present")
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
