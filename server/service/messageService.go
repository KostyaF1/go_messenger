package service

import (
	"go_messenger/server/db/dbservice"
	"go_messenger/server/db/dbservice/dbInterfaces"
	"go_messenger/server/models"
	"go_messenger/server/service/serviceModels"
	"go_messenger/server/userConnections"
)

//MessageService struct of Message model on service level
type MessageService struct {
	messageManager dbInterfaces.MessageManager
	groupManager   dbInterfaces.GroupManager
}

//SendMessageTo method add message to DB and gets list of group members.
func (s *MessageService) SendMessageTo(messageIn *userConnections.MessageIn, chanOut chan<- *serviceModels.MessageOut) {
	s.messageManager = dbservice.MessageDBService{}
	s.groupManager = dbservice.GroupDBService{}
	s.messageManager.AddMessage(&messageIn.Message)
	members := s.groupManager.GetMemberList(&messageIn.Group)
	messageOut := serviceModels.MessageOut{User: messageIn.User,
		Members: members,Message:messageIn.Message Action: messageIn.Action}
	messageOut.GroupList = append(messageOut.GroupList, *groupOut)
	chanOut <- &messageOut
}
