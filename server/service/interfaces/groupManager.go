package interfaces

import (
	"go_messenger/server/models"
)

//GroupManager as contract between DBservice level and Service Level
type GroupManager interface {
	CreateGroup(group *models.Group) (bool, error)
	AddGroupMember(user *models.User, group *models.Group, message *models.Message) (bool, error)
	GetGroupList(user *models.User) ([]models.Group, error)
	GetGroup(group *models.Group) (models.Group, error)
	GetMemberList(group *models.Group) ([]models.User, error)
	EditGroup(group *models.Group) bool
}
