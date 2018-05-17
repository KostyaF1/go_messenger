package models

import (
	"github.com/jinzhu/gorm"
)

type User struct {
	gorm.Model

	Login string
	Password string
	Username string
	Status bool
	UserIcon string
}
