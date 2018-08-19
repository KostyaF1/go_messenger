package dbservice

import (
	"fmt"
	"go_messenger/server/db"
	"strings"

	"log"

	"github.com/jinzhu/gorm"
	//ignoring init from package below
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

var dbConn *gorm.DB

// OpenConnDB opens a connection either DB it returns a *DB object for closing the connection in main
func OpenConnDB() *gorm.DB {
	var err error
	dbinfo := fmt.Sprintf("host=%s port=%s user=%s dbname=%s password=%s sslmode=%s", db.HostDB, db.PortDB, db.UserDB, db.NameDB, db.PasswordDB, db.SSLModeDB)
	dbConn, err = gorm.Open("postgres", dbinfo)
	if err != nil {
		log.Println("gorm Open connection error: ", strings.ToUpper(err.Error()))
	} else {
		log.Println("DB opened ok")
	}
	return dbConn
}
