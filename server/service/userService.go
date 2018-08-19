package service

import (
	"errors"
	"go_messenger/server/models"
	"go_messenger/server/service/interfaces"
	"go_messenger/server/service/serviceModels"
	"go_messenger/server/userConnections"
)

//UserService ...
type UserService struct {
	userManager    interfaces.UserManager
	groupManager   interfaces.GroupManager
	messageManager interfaces.MessageManager
}

//InitUserService Method that init Interfaces of DB level
func (u *UserService) InitUserService(ui interfaces.UserManager, gi interfaces.GroupManager, mi interfaces.MessageManager) {
	u.userManager = ui
	u.groupManager = gi
	u.messageManager = mi
}

//CreateUser function creats a special User and makes a record in DB. It returns bool value
func (u *UserService) CreateUser(messageIn *userConnections.MessageIn, chanOut chan<- *serviceModels.MessageOut) {
	messageOut := serviceModels.MessageOut{Action: messageIn.Action}
	if messageIn.User.Password == "" || messageIn.User.Login == "" {
		messageOut.Err = "Empty Login or Password"
		messageOut.Status = false
		chanOut <- &messageOut
		return
	}
	ok, err := u.userManager.CreateUser(&messageIn.User)
	if err != nil {
		messageOut.Err = "DBError when CreateUser. " + err.Error()
	}
	messageOut.Status = ok
	chanOut <- &messageOut
}

//LoginUser - user's auth.
func (u *UserService) LoginUser(messageIn *userConnections.MessageIn, chanOut chan<- *serviceModels.MessageOut) {
	messageOut := serviceModels.MessageOut{Action: messageIn.Action}
	if messageIn.User.Password == "" || messageIn.User.Login == "" {
		messageOut.Err = "Empty Login or Password"
		messageOut.Status = false
		chanOut <- &messageOut
		return
	}

	ok, err := u.userManager.LoginUser(&messageIn.User)
	if err != nil {
		messageOut.Err = "Error when LoginUser. " + err.Error()
		chanOut <- &messageOut
		return
	}

	if ok {
		groupList, err := u.groupManager.GetGroupList(&messageIn.User)
		if err != nil {
			var serviceErr = ErrorService{}
			custErr := errors.New("Can't get group list")
			serviceErr.SendError(custErr, messageIn.User, chanOut)
			return
		}

		for _, group := range groupList {
			members, er := u.groupManager.GetMemberList(&group)
			if er != nil {
				var serviceErr = ErrorService{}
				custErr := errors.New("Can't get member list")
				serviceErr.SendError(custErr, messageIn.User, chanOut)
				return
			}
			groupOut := serviceModels.Group{GroupName: group.GroupName, GroupType: group.GroupType,
				Members:  members,
				Messages: u.messageManager.GetGroupMessages(&group, messageIn.MessageLimit),
				ID:       group.ID,
			}
			messageOut.GroupList = append(messageOut.GroupList, groupOut)
		}

		messageOut.User, err = u.userManager.GetAccount(&messageIn.User)
		if err != nil {
			var serviceErr = ErrorService{}
			custErr := errors.New("Can't get Account")
			serviceErr.SendError(custErr, messageIn.User, chanOut)
			return
		}

		messageOut.ContactList, err = u.userManager.GetContactList(&messageIn.User)
		if err != nil {
			var serviceErr = ErrorService{}
			custErr := errors.New("Can't get contact list")
			serviceErr.SendError(custErr, messageIn.User, chanOut)
			return
		}
	}

	messageOut.User = messageIn.User
	messageOut.Status = ok
	chanOut <- &messageOut
}

//AddContact add spesial user to contact list of special User
func (u *UserService) AddContact(messageIn *userConnections.MessageIn, chanOut chan<- *serviceModels.MessageOut) {
	messageOut := serviceModels.MessageOut{User: messageIn.User,
		Action: messageIn.Action}
	ok, err := u.userManager.AddContact(&messageIn.User, &messageIn.Contact, messageIn.RelationType)
	if err != nil {
		var serviceErr = ErrorService{}
		custErr := errors.New("Can't add contact")
		serviceErr.SendError(custErr, messageIn.User, chanOut)
		return
	}
	messageOut.Status = ok
	chanOut <- &messageOut
}

//GetContactList get list of User's contacts
func (u *UserService) GetContactList(messageIn *userConnections.MessageIn, chanOut chan<- *serviceModels.MessageOut) {
	messageOut := serviceModels.MessageOut{User: messageIn.User,
		Action: messageIn.Action}
	var err error
	messageOut.ContactList, err = u.userManager.GetContactList(&messageIn.User)
	if err != nil {
		var serviceErr = ErrorService{}
		custErr := errors.New("Can't get contact list")
		serviceErr.SendError(custErr, messageIn.User, chanOut)
		return
	}
	chanOut <- &messageOut
}

//DeleteContact delete User's contact from contact list
func (u *UserService) DeleteContact(messageIn *userConnections.MessageIn, chanOut chan<- *serviceModels.MessageOut) {
	messageOut := serviceModels.MessageOut{
		Action: messageIn.Action,
	}
	var err error
	messageOut.Status, err = u.userManager.DeleteContact(&messageIn.User, &messageIn.Contact)
	if err != nil {
		var serviceErr = ErrorService{}
		custErr := errors.New("Can't delete contact")
		serviceErr.SendError(custErr, messageIn.User, chanOut)
		return
	}
	chanOut <- &messageOut
}

//GetUsers method get all users from DB.
func (u *UserService) GetUsers(messageIn *userConnections.MessageIn, chanOut chan<- *serviceModels.MessageOut) {
	messageOut := serviceModels.MessageOut{Action: messageIn.Action, User: messageIn.User}
	userList := []models.User{}
	u.userManager.GetUsers(&userList)
	messageOut.ContactList = userList
	chanOut <- &messageOut
}

//GetUser method get special user from DB.
func (u *UserService) GetUser(messageIn *userConnections.MessageIn, chanOut chan<- *serviceModels.MessageOut) {
	messageOut := serviceModels.MessageOut{User: messageIn.User, Action: messageIn.Action}
	user, err := u.userManager.GetUser(&messageIn.User)
	if err != nil {
		var serviceErr = ErrorService{}
		custErr := errors.New("Can't get User")
		serviceErr.SendError(custErr, messageIn.User, chanOut)
		return
	}
	messageOut.ContactList = append(messageOut.ContactList, user)
	chanOut <- &messageOut
}

//EditUser method edit own client's user and saves it in DB.
func (u *UserService) EditUser(messageIn *userConnections.MessageIn, chanOut chan<- *serviceModels.MessageOut) {
	updatedUser := u.userManager.EditUser(&messageIn.User)
	messageOut := serviceModels.MessageOut{Action: messageIn.Action, User: messageIn.User, Status: updatedUser.Status}
	chanOut <- &messageOut
}

//DeleteUser method delete own account from DB.
func (u *UserService) DeleteUser(messageIn *userConnections.MessageIn, chanOut chan<- *serviceModels.MessageOut) {
	messageOut := serviceModels.MessageOut{
		Action: messageIn.Action,
	}
	var err error
	messageOut.Status, err = u.userManager.DeleteUser(&messageIn.User)
	if err != nil {
		var serviceErr = ErrorService{}
		custErr := errors.New("Can't delete user")
		serviceErr.SendError(custErr, messageIn.User, chanOut)
		return
	}
	chanOut <- &messageOut
}
