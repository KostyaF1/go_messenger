var user = {
    ID: 0,
    Login: '',
    Password: '',
    Username: '',
    Email: '',
    Status: false,
    UserIcon: ''
};

var message = {
    User: user,
    Group: { GroupName: '' },
    Content: ''
};
var group = {
    GroupName: '',
    Messages: [message],
    Members: [user],
    ID: null
};

var test = new Vue({
    el: '#app',
    data: {
        MessageIn: {
            User: user,
            Contact: user,
            Group: group,
            Message: message,
            Members: [user],
            RelationType: 0,
            MessageLimit: 0,
            Action: ''
        },

        User: user,
        ContactList: [user],
        GroupList: [group],
        Message: [message],
        Recipients: [user],
        Status: null,
        Action: '',
        ws: null, // Our websocket
        UsersFromServer: {},
        RecContents: {},
        RecContent: '',
        joined: false, // True if email and username have been filled in
        OnlineUsers: '',
        OnlineUsersList: [],
        OurUsername: ''
    },

    created: function() {
        var self = this;
        var element = document.getElementById('chat-messages');
        this.ws = new WebSocket('ws://' + window.location.host + '/ws');
        this.ws.addEventListener('message', function(e) {
            var msg = JSON.parse(e.data);
            if (typeof msg.User.ID != 'undefined') {
                self.User.ID = msg.User.ID;
            }
            if (msg.Action == 'LoginUser') {
                if (
                    typeof msg.GroupList != 'undefined' &&
                    msg.GroupList != null
                ) {
                    for (var i = 0; i < msg.GroupList.length; i++) {
                        for (
                            var c = 0;
                            c < msg.GroupList[i].Members.length;
                            c++
                        ) {
                            if (
                                msg.GroupList[i].Members[c].Login !=
                                self.OurUsername
                            ) {
                                self.OnlineUsersList.push({
                                    id: msg.GroupList[i].GroupName,
                                    content: msg.GroupList[i].Members[c].Login,
                                    action: changeUser
                                });
                                // self.OnlineUsers +=
                                //     '<div class="input-field col s12">' +
                                //     '<button class="waves-effect waves-light btn col s12" onclick=changeUser(this) id = ' +
                                //     msg.GroupList[i].GroupName +
                                //     '>' +
                                //     msg.GroupList[i].Members[c].Login +
                                //     '</button></div>' +
                                //     '<br/>';
                            }
                        }
                        if (typeof msg.GroupList[i].Messages != 'undefined') {
                            for (
                                var j = 0;
                                j < msg.GroupList[i].Messages.length;
                                j++
                            ) {
                                if (
                                    typeof self.RecContents[
                                        msg.GroupList[i].GroupName
                                    ] == 'undefined'
                                ) {
                                    self.RecContents[
                                        msg.GroupList[i].GroupName
                                    ] =
                                        '';
                                }
                                self.RecContents[msg.GroupList[i].GroupName] +=
                                    '<div class="chip">' +
                                    msg.GroupList[i].Members[0].Username +
                                    '</div>' +
                                    '<div class="white-text">' +
                                    msg.GroupList[i].Messages[j].Content +
                                    '</div>' +
                                    '<br/>';
                            }
                        }
                    }
                }
            } else if (msg.Action == 'SendMessageTo') {
                if (
                    typeof self.RecContents[msg.GroupList[0].GroupName] ==
                    'undefined'
                ) {
                    self.RecContents[msg.GroupList[0].GroupName] = '';
                    // var a = document.getElementById(
                    //     test.User.Username + msg.Message.User.Username
                    // );
                    // console.log(a);
                    // if (a != null) {
                    //     a.remove();
                    // }
                    // let found = self.OnlineUsersList.find((element) => {
                    //     return element.userName == test.User.Username && element.contactName == msg.Message.User.Username;
                    // });

                    for (let i in self.OnlineUsersList) {
                        if (
                            self.OnlineUsersList[i].id ==
                            test.User.Username + msg.Message.User.Username
                        ) {
                            self.OnlineUsers[i].action = changeUser;
                            self.OnlineUsers[i].id = msg.GroupList[0].GroupName;
                            self.OnlineUsers[i].content =
                                msg.Message.User.Username;
                        }
                    }

                    // self.OnlineUsers +=
                    //     '<div class="input-field col s12">' +
                    //     '<button class="waves-effect waves-light btn col s12" onclick=changeUser(this) id = ' +
                    //     msg.GroupList[0].GroupName +
                    //     '>' +
                    //     msg.Message.User.Username +
                    //     '</button></div>' +
                    //     '<br/>';
                }

                self.RecContents[msg.GroupList[0].GroupName] +=
                    '<div class="chip">' +
                    msg.Message.User.Username +
                    '</div>' +
                    '<div class="white-text">' +
                    msg.Message.Content +
                    '</div>' +
                    '<br/>';
                self.RecContent = self.RecContents[msg.GroupList[0].GroupName];
            } else if (msg.Action == 'GetUsers') {
                test.User = msg.User;
                self.OnlineUsers = '';
                self.OnlineUsersList = [];
                for (var i = 0; i < msg.ContactList.length; i++) {
                    if (test.User.Username != msg.ContactList[i].Username) {
                        var gName =
                            msg.User.Username + msg.ContactList[i].Username;
                        test.UsersFromServer[gName] = msg.ContactList[i];
                        self.OnlineUsersList.push({
                            id: msg.User.Username + msg.ContactList[i].Username,
                            content: msg.ContactList[i].Username,
                            action: createGroup
                        });
                        // self.OnlineUsers +=
                        //     '<div class="input-field col s12">' +
                        //     '<button class="waves-effect waves-light btn col s12" onclick=createGroup(this) id = ' +
                        //     msg.User.Username +
                        //     msg.ContactList[i].Username +
                        //     '>' +
                        //     msg.ContactList[i].Username +
                        //     '</button></div>' +
                        //     '<br/>';
                    }
                }
            }

            element.scrollTop = element.scrollHeight; // Auto scroll to the bottom
        });
    },

    methods: {
        send: function() {
            if (this.MessageIn.Message.Content != '') {
                this.MessageIn.Message.User.Username = this.OurUsername;
                this.MessageIn.Message.MessageSenderID = this.User.ID;
                this.MessageIn.User.Login = this.OurUsername;
                this.MessageIn.User.Username = this.OurUsername;
                this.MessageIn.Message.Content = $('<p>')
                    .html(this.MessageIn.Message.Content)
                    .text();
                this.MessageIn.Message.Group.GroupName = this.MessageIn.Group.GroupName;
                this.MessageIn.Action = 'SendMessageTo';
                if (
                    typeof this.RecContents[this.MessageIn.Group.GroupName] ==
                    'undefined'
                ) {
                    this.RecContents[this.MessageIn.Group.GroupName] = '';
                }
                this.RecContents[this.MessageIn.Group.GroupName] +=
                    '<div class="chip">' +
                    this.OurUsername +
                    '</div>' +
                    '<div class="white-text">' +
                    this.MessageIn.Message.Content +
                    '</div>' +
                    '<br/>';
                var self = this;
                self.RecContent = this.RecContents[
                    this.MessageIn.Group.GroupName
                ];
                this.ws.send(JSON.stringify(this.MessageIn));
                this.MessageIn.Message.Content = '';
            }
        },

        join: function() {
            if (!this.MessageIn.User.Login) {
                Materialize.toast('You must choose a username', 2000);
                return;
            }
            this.MessageIn.User.Username = $('<p>')
                .html(this.MessageIn.User.Login)
                .text();
            this.MessageIn.User.Login = $('<p>')
                .html(this.MessageIn.User.Login)
                .text();
            this.MessageIn.User.Password = $('<p>')
                .html(this.MessageIn.User.Password)
                .text();
            this.MessageIn.User.Email = 'email';
            this.MessageIn.User.Status = true;
            this.MessageIn.User.UserIcon = 'usericon';
            this.MessageIn.Action = 'LoginUser';
            this.OurUsername = this.MessageIn.User.Username;
            this.ws.send(JSON.stringify(this.MessageIn));
            this.joined = true;
        },
        signUp: function() {
            if (!this.MessageIn.User.Login) {
                Materialize.toast('You must choose a username', 2000);
                return;
            }
            this.MessageIn.User.Username = $('<p>')
                .html(this.MessageIn.User.Login)
                .text();
            this.MessageIn.User.Login = $('<p>')
                .html(this.MessageIn.User.Login)
                .text();
            this.MessageIn.User.Password = $('<p>')
                .html(this.MessageIn.User.Password)
                .text();
            this.MessageIn.User.Email = 'email';
            this.MessageIn.User.Status = true;
            this.MessageIn.User.UserIcon = 'usericon';
            this.MessageIn.Action = 'CreateUser';
            this.ws.send(JSON.stringify(this.MessageIn));
        },
        showUsers: function() {
            this.MessageIn.User.Login = this.OurUsername;
            this.MessageIn.User.Username = this.OurUsername;
            this.MessageIn.Action = 'GetUsers';
            this.ws.send(JSON.stringify(this.MessageIn));
        }
    }
});

function changeUser(el) {
    test.MessageIn.Group.GroupName = el.id;
    test.RecContent = test.RecContents[el.id];
}

function createGroup(el) {
    test.MessageIn.Action = 'CreateGroup';
    test.MessageIn.Group.GroupTypeID = 1;
    test.MessageIn.Group.User = test.User;
    test.MessageIn.Group.GroupOwnerID = test.User.ID;
    test.MessageIn.Group.GroupName = el.id;
    test.MessageIn.Members[0] = test.User;
    test.MessageIn.Members[1] = test.UsersFromServer[el.id];
    test.ws.send(JSON.stringify(test.MessageIn));
    //el.remove();

    for (let i in self.OnlineUsersList) {
        if (self.OnlineUsersList[i].id == el.id) {
            self.OnlineUsers[i].action = changeUser;
            self.OnlineUsers[i].id = test.MessageIn.Group.GroupName;
            self.OnlineUsers[i].content = test.MessageIn.Members[1].Username;
        }
    }

    // var element = document.getElementById('chat-messages');
    // element.innerHTML +=
    //     '<div class="input-field col s12">' +
    //     '<button class="waves-effect waves-light btn col s12" onclick=changeUser(this) id = ' +
    //     test.MessageIn.Group.GroupName +
    //     '>' +
    //     test.MessageIn.Members[1].Username +
    //     '</button></div>' +
    //     '<br/>';
}
