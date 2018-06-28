package tcp

import (
	"encoding/json"
	"go_messenger/server/service/serviceModels"
	"log"
	"net"
)

//WaitJSON is waiting for data from route out, parsing data into json format and write to util
func WaitJSON(conns []net.Conn, str *serviceModels.MessageOut) {
	//log.Println("handler out", str.GroupList[0].Messages[0].Content, str.User.ID)

	//for _, as := range str.GroupList{
	//	fmt.Println(as.GroupName)
	//}
	log.Println(str.Message.Content)
	outComingData, err := json.Marshal(str)
	if err != nil {
		log.Println(err)
	}
	for _, conn := range conns {
		//todo ask how i may optimize it!
		_, err := conn.Write(outComingData)
		if err != nil {
			log.Println(err)
		}
		_, err = conn.Write([]byte("\n"))
		if err != nil {
			log.Println(err)
		}
	}
}
