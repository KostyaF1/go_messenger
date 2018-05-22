package dbservice
	
import (
	"../../models"
)

func GetMessages(count int, groupName string) []models.Message{
	db := dbconnect()
	defer db.Close()
	group := models.Group{}
	messages := []models.Message{}
	db.Where("group_name = ?", groupName).First(&group)
	db.Where("message_recipient_id = ?", group.ID).Limit(count).Find(&messages)
	return messages
}

func GetGroupList(username string) []models.Group{
	db := dbconnect()
	defer db.Close()
	user := models.User{}
	db.Where("username = ?", username).First(&user)
	groups := []models.Group{}
	db.Joins("join group_members on groups.id=group_members.group_id").Where("user_id = ?", user.ID).Find(&groups) 
	return groups
}

func GetGroupUserList(groupName string) []models.User{
	db := dbconnect()
	defer db.Close()
	group := models.Group{}
	users := []models.User{}
	db.Where("group_name = ?", groupName).First(&group)
	db.Joins("join group_members on users.id=group_members.user_id").Where("group_id =?", group.ID).Find(&users)
	return users
}
func FindUser(username string) models.User{
	db := dbconnect()
	defer db.Close()
	user := models.User{}
	db.Where("username = ?", username).First(&user)
	return user
}

func GetContactList(username string) []models.User{
	db := dbconnect()
	defer db.Close()
	user := models.User{}
	temp := []models.UserRelation{}
	friends := []models.User{}
	db.Where("username = ?", username).First(&user)
	db.Where("relating_user=?",user.ID).Find(&temp)
	for i,_:= range temp{
		friend := models.User{}
		db.Where("id=?",temp[i].RelatedUser).First(&friend)
		friends = append(friends, friend)
		
	}
	return friends

}
