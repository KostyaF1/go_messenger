package routerIn

import (
	"errors"
	"go_messenger/server/service"
	"go_messenger/server/service/interfaces"
	"go_messenger/server/service/serviceModels"
	"go_messenger/server/userConnections"
)

var userService = service.UserService{}
var groupService = service.GroupService{}
var messageService = service.MessageService{}

//InitServices to init service.Service structure
func InitServices(ui interfaces.UserManager, gi interfaces.GroupManager, mi interfaces.MessageManager) {
	userService.InitUserService(ui, gi, mi)
	groupService.InitGroupService(ui, gi, mi)
	messageService.InitMessageService(ui, gi, mi)
}

//RouterIn is function which directs data to next step by action field in messageIn structure
func RouterIn(messageIn *userConnections.MessageIn, chanOut chan *serviceModels.MessageOut) {

	// variable "action" is a command what to do with the structures
	action := messageIn.Action

	switch action {

	case "SendMessageTo":
		go messageService.SendMessageTo(messageIn, chanOut)
	case "CreateUser":
		go userService.CreateUser(messageIn, chanOut)
	case "LoginUser":
		go userService.LoginUser(messageIn, chanOut)
	case "EditUser":
		go userService.EditUser(messageIn, chanOut)
	case "CreateGroup":
		go groupService.CreateGroup(messageIn, chanOut)
	case "EditGroup":
		go groupService.EditGroup(messageIn, chanOut)
	case "AddGroupMember":
		go groupService.AddGroupMember(messageIn, chanOut)
	case "GetUsers":
		go userService.GetUsers(messageIn, chanOut)
	case "GetGroup":
		go groupService.GetGroup(messageIn, chanOut)
	case "GetGroupList":
		go groupService.GetGroupList(messageIn, chanOut)
	case "GetUser":
		go userService.GetUser(messageIn, chanOut)
	case "AddContact":
		go userService.AddContact(messageIn, chanOut)
	case "GetContactList":
		go userService.GetContactList(messageIn, chanOut)

	default:
		var errorService = service.ErrorService{}
		err := errors.New("unknown action error")
		go errorService.SendError(err, messageIn.User, chanOut)
	}
}
