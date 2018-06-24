package windows

import (
	"net"
	"github.com/ProtonMail/ui"
	"go_messenger/desktop/structure"
	"log"
	"go_messenger/desktop/util"
	"go_messenger/desktop/config"
)

func DrawAuthWindow(conn net.Conn) {
	window := ui.NewWindow("Chat", 500, 500, false)
	loginInput := ui.NewEntry()

	passwordInput := ui.NewPasswordEntry()
	loginLabel := ui.NewLabel("Login")
	passwordLabel := ui.NewLabel("Password")
	signIn := ui.NewButton("Sign in!")
	signUp := ui.NewButton("Sign up!")
	topBox := ui.NewHorizontalBox()
	botBox := ui.NewHorizontalBox()
	middleBox := ui.NewHorizontalBox()
	fieldsBox := ui.NewVerticalBox()
	leftFieldBoxPadding := ui.NewVerticalBox()
	rightFieldBoxPadding := ui.NewVerticalBox()
	mainBox := ui.NewVerticalBox()
	fieldsBox.Append(loginLabel, false)
	fieldsBox.Append(loginInput, false)
	fieldsBox.Append(passwordLabel, false)
	fieldsBox.Append(passwordInput, false)
	fieldsBox.Append(signIn, false)
	fieldsBox.Append(signUp, false)
	middleBox.Append(leftFieldBoxPadding, true)
	middleBox.Append(fieldsBox, false)
	middleBox.Append(rightFieldBoxPadding, true)
	mainBox.Append(topBox, true)
	mainBox.Append(middleBox, true)
	mainBox.Append(botBox, true)
	window.SetChild(mainBox)
	window.OnClosing(func(*ui.Window) bool {
		ui.Quit()
		return true
	})
	window.Show()

	//обработчик кнопки входа, который отправляет запрос на получение всех юзеров в базе
	//для вывода и создание кнопок с ними
	signIn.OnClicked(func(*ui.Button) {
		//формирование новой структуры на отправку на сервер,
		//заполнение текущего экземпляра требуемыми полями.

		message := util.MessageOut{
			User: structure.User{
				Login:    config.Login,
				Password: passwordInput.Text(),
				Username: config.Login,
				Email:    "test@test.com",
				Status:   true,
				UserIcon: "testUserIcon",
			},
			Contact:      structure.User{},
			Group:        structure.Group{},
			Message:      structure.Message{},
			Members:      nil,
			RelationType: 1,
			MessageLimit: 1,
			Action:       "GetUsers",
		}
		_, err := conn.Write([]byte(util.JSONencode(message)))
		if err != nil {
			log.Println(err)
		}
		config.Login = loginInput.Text()
		window.Hide()
		DrawChatWindow(conn)
		log.Println(config.Users)
	})
	signUp.OnClicked(func(*ui.Button) {
		//формирование новой структуры на отправку на сервер,
		//заполнение текущего экземпляра требуемыми полями.

		message := util.MessageOut{
			User: structure.User{
				Login:    config.Login,
				Password: passwordInput.Text(),
				Username: config.Login,
				Email:    "test@test.com",
				Status:   true,
				UserIcon: "testUserIcon",
			},
			Contact:      structure.User{},
			Group:        structure.Group{},
			Message:      structure.Message{},
			Members:      nil,
			RelationType: 1,
			MessageLimit: 1,
			Action:       "CreateUser",
		}
		_, err := conn.Write([]byte(util.JSONencode(message)))
		if err != nil {
			log.Println(err)
		}
		window.Hide()
		DrawChatWindow(conn)
	})

	channel := make(chan bool)

	go func() {
		for {
			msg := util.JSONdecode(conn)
			for _, contacts := range msg.ContactList {
				config.Users = append(config.Users, contacts.Login)
			}
			log.Println(config.Users, "READER")
			channel <- msg.Status
		}
	}()

}
