package main

import "log"

type User struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (u *User) hasValidFields() bool {
	if len(u.Email) <= 0 {
		log.Println("User has no email")
		return false
	}
	if len(u.Password) <= 0 {
		log.Println("User has no password")
		return false
	}
	return true
}
