

var user={

    'ID': 0,
    'Login': '',
    'Password': '',
    'Username': '',
    'Email': '',
    'Status': false,
    'UserIcon': '',
};

var message={
    'User': user,
    'Group': {'GroupName': ''},
    'Content': '',
    'MessageRecipientID':0,
};
var group={
    'GroupName': '',
    'Messages':[message],
    'Members': [user],
    'ID': null,
    'GroupType': {},
};


var test = new Vue({
    el: '#app',
    data: {
        MessageIn:{
            User: user,
            Contact: user,
            Group: group,
            Message: message,
            Members: [user],
            RelationType: 0,
            MessageLimit: 0,
            Action: '',
        },
        ProfileStr:{
            ProfileUser: user,
            Friend: false,
            NotMy: false,
            ProfileGroupName: '',
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
        profile: false,
        OnlineUsers: '',
        MyGroups: '',
        searchUser: '',
        creatingGroup:'',


    },


    created: function () {
        var self = this;
        var element = document.getElementById('chat-messages');
        this.ws = new WebSocket('ws://' + window.location.host + '/ws');
        this.ws.addEventListener('message', function (e) {
            var msg = JSON.parse(e.data);

            if (msg.Action == "LoginUser") {
                if(msg.Status == false){
                    location.reload();
                }
                if (typeof msg.User != "undefined") {
                    test.User = msg.User;
                }
                if (typeof msg.ContactList != "undefined"){
                    test.ContactList = msg.ContactList;
                }
                if(typeof msg.GroupList != "undefined" && msg.GroupList != null) {
                    test.GroupList = msg.GroupList;
                    for (var i = 0; i < msg.GroupList.length; i++) {
                         if(msg.GroupList[i].Members.length >2){
                            self.MyGroups +=
                                    '<div class="input-field col s12">' +
                                    '<button class="waves-effect waves-light btn col s12" onclick=changeUser(this) id = ' +
                                    msg.GroupList[i].GroupName + '>' +
                                    msg.GroupList[i].GroupName +
                                    '</button></div>' +
                                    '<br/>';
                         }


                        if(msg.GroupList[i].Members.length == 2){
                        for (var c = 0; c < msg.GroupList[i].Members.length; c++) {
                            if (msg.GroupList[i].Members[c].Login != self.User.Login) {
                                self.MyGroups +=
                                    '<div class="input-field col s12">' +
                                    '<button class="waves-effect waves-light btn col s12" onclick=changeUser(this) id = ' +
                                    msg.GroupList[i].GroupName + '>' +
                                    msg.GroupList[i].Members[c].Username +
                                    '</button></div>' +
                                    '<br/>';
                            }

                        }
                        if(typeof msg.GroupList[i].Messages !=  "undefined") {
                            for (var j = 0; j <msg.GroupList[i].Messages.length; j++) {
                                if (typeof self.RecContents[msg.GroupList[i].GroupName] == "undefined") {
                                    self.RecContents[msg.GroupList[i].GroupName] = '';
                                }
                                self.RecContents[msg.GroupList[i].GroupName] +=
                                    '<div class="chip">' +
                                    msg.GroupList[i].Members[0].Username +
                                    '</div>' +
                                    '<div class="white-text">' +
                                    msg.GroupList[i].Messages[j].Content + '</div>' +
                                    '<br/>';
                            }
                        }

}


                    }
                }
            }else if (msg.Action == "SendMessageTo") {
                if(msg.Message.User.Username != test.User.Username) {
                    if (typeof self.RecContents[msg.Message.Group.GroupName] == "undefined") {
                        self.RecContents[msg.Message.Group.GroupName] = '';
                        if(msg.Message.Group.GroupTypeID == 1) {
                            var a = document.getElementById(test.User.Login + msg.Message.User.Login);
                            console.log(a);
                            if (a != null) {
                                a.remove();
                            }
                            self.MyGroups +=
                                '<div class="input-field col s12">' +
                                '<button class="waves-effect waves-light btn col s12" onclick=changeUser(this) id = ' +
                                msg.Message.Group.GroupName + '>' +
                                msg.Message.User.Username +
                                '</button></div>' +
                                '<br/>';
                        }else{
                            var elg = document.getElementById(msg.Message.Group.GroupName);
                            if(elg ==null) {

                                self.MyGroups +=
                                    '<div class="input-field col s12">' +
                                    '<button class="waves-effect waves-light btn col s12" onclick=changeUser(this) id = ' +
                                    msg.Message.Group.GroupName + '>' +
                                    msg.Message.Group.GroupName +
                                    '</button></div>' +
                                    '<br/>';
                            }
                        }
                    }
                    if (Notification.permission === "granted") {
                        var notification = new Notification(msg.Message.User.Username+"\n"+msg.Message.Content);
                        setTimeout(notification.close.bind(notification), 1000);
                        notification = null;
                    }
                    self.RecContents[msg.Message.Group.GroupName] +=
                        '<div class="chip">' +
                        msg.Message.User.Username +
                        '</div>' +
                        '<div class="white-text">' +
                        msg.Message.Content + '</div>' +
                        '<br/>';

                    self.RecContent = self.RecContents[msg.Message.Group.GroupName];
                }
            }else if(msg.Action =="GetUsers"){

                //this.User = msg.User;
                var modWin = document.getElementById('chat-messages');
                modWin.innerHTML ='';
                modWin.innerHTML = '<div id="modChange"></div>';
                var modWin = document.getElementById('modChange');
                modWin.innerHTML ='';
                if (typeof msg.ContactList != "undefined") {
                    test.ContactList = msg.ContactList;
                    for (var i = 0; i < msg.ContactList.length; i++) {
                        if (test.User.Login != msg.ContactList[i].Login) {
                            var gName = test.User.Login + msg.ContactList[i].Login;
                            test.UsersFromServer[gName] = msg.ContactList[i];
                            modWin.innerHTML +=
                                '<div class="input-field col s12">' +
                                '<button class="waves-effect waves-light btn col s12" onclick=reftoshowProfile(this) id = ' +
                                gName + '>' +
                                msg.ContactList[i].Username +
                                '</button></div>' +
                                '<br/>';
                        }
                    }
                }
                //modWin.innerHTML ='';


            }else if(msg.Action == "GetContactList"){
                var modWin = document.getElementById('chat-messages');
                modWin.innerHTML ='';
                modWin.innerHTML = '<div id="modChange"></div>';
                var modWin = document.getElementById('modChange');
                modWin.innerHTML ='';
                if (typeof msg.ContactList != "undefined") {
                    test.ContactList = msg.ContactList;
                    for (var i = 0; i < msg.ContactList.length; i++) {
                        if (test.User.Login != msg.ContactList[i].Login) {
                            var gName = test.User.Login + msg.ContactList[i].Login;
                            test.UsersFromServer[gName] = msg.ContactList[i];
                            modWin.innerHTML +=
                                '<div class="input-field col s12">' +
                                '<button class="waves-effect waves-light btn col s12" onclick=reftoshowProfile(this) id = ' +
                                gName + '>' +
                                msg.ContactList[i].Username +
                                '</button></div>' +
                                '<br/>';
                        }
                    }
                }
            }


            element.scrollTop = element.scrollHeight;// Auto scroll to the bottom
        });
    },

    methods: {
        send: function () {
            if (this.MessageIn.Message.Content != '') {
                this.MessageIn.Message.User.Username = this.User.Username;
                this.MessageIn.Message.User.Login = this.User.Login;
                this.MessageIn.Message.User.ID = test.User.ID;
                this.MessageIn.Message.MessageSenderID = test.User.ID;
                this.MessageIn.User.Login = this.User.Login;
                this.MessageIn.Message.Group.MessageSenderID = test.User.ID;
                this.MessageIn.User.Username = this.User.Username;
                this.MessageIn.Message.Content = $('<p>').html(this.MessageIn.Message.Content).text();
                this.MessageIn.Message.Group.GroupName = this.MessageIn.Group.GroupName;
                if(typeof test.GroupList != "undefined")
                    for(var i=0;i<test.GroupList.length;i++)
                    {
                        if(test.GroupList[i].GroupName == this.MessageIn.Group.GroupName)
                        {
                            this.MessageIn.Message.Group = test.GroupList[i];
                            this.MessageIn.Message.MessageRecipientID = test.GroupList[i].ID
                        }
                    }
                this.MessageIn.Action = "SendMessageTo";
                if (typeof this.RecContents[this.MessageIn.Group.GroupName] == "undefined"){
                    this.RecContents[this.MessageIn.Group.GroupName] = '';
                }
                this.RecContents[this.MessageIn.Group.GroupName] +=
                    '<div class="chip">' +
                    test.User.Username +
                    '</div>' +
                    '<div class="white-text">' +
                    this.MessageIn.Message.Content +
                    '</div>' +
                    '<br/>';
                var self = this;
                self.RecContent = this.RecContents[this.MessageIn.Group.GroupName];
                this.ws.send(JSON.stringify(this.MessageIn));
                this.MessageIn.Message.Content = '';
            }
        },

        join: function () {
            if (Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
            if (!this.MessageIn.User.Login) {
                Materialize.toast('You must choose a login', 2000);
                return;
            }
            if (!this.MessageIn.User.Password) {
                Materialize.toast('You must choose a password', 2000);
                return;
            }
            this.MessageIn.User.Login = $('<p>').html(this.MessageIn.User.Login).text();
            this.MessageIn.User.Password = $('<p>').html(this.MessageIn.User.Password).text();
            this.MessageIn.User.Status = true;

            this.MessageIn.Action = "LoginUser";

            this.User.Login = this.MessageIn.User.Login;

            this.ws.send(JSON.stringify(this.MessageIn));
            document.title = this.User.Login;
            this.joined = true;
        },
        signUp: function () {
            if (!this.MessageIn.User.Login) {
                Materialize.toast('You must choose a login', 2000);
                return;
            }
            if (!this.MessageIn.User.Username) {
                Materialize.toast('You must choose a username', 2000);
                return;
            }
            if (!this.MessageIn.User.Password) {
                Materialize.toast('You must choose a password', 2000);
                return;
            }
            if (!this.MessageIn.User.Email) {
                Materialize.toast('You must choose a email', 2000);
                return;
            }

            this.MessageIn.User.Username = $('<p>').html(this.MessageIn.User.Username).text();
            this.MessageIn.User.Login = $('<p>').html(this.MessageIn.User.Login).text();
            this.MessageIn.User.Password = $('<p>').html(this.MessageIn.User.Password).text();
            this.MessageIn.User.Email = $('<p>').html(this.MessageIn.User.Email).text();
            this.MessageIn.User.UserIcon = $('<p>').html(this.MessageIn.User.UserIcon).text();
            console.log($('<p>').html(this.MessageIn.User.UserIcon).text());
            if(this.MessageIn.User.UserIcon == ''){
                this.MessageIn.User.UserIcon = "http://ishowmy.support/img/user-icon-360x360.jpg";
            }
            this.MessageIn.User.Status = true;

            this.MessageIn.Action = "CreateUser";

            this.User.Username = this.MessageIn.User.Username;
            this.User.Login = this.MessageIn.User.Login;

            this.ws.send(JSON.stringify(this.MessageIn));
            location.href="index.html"
        },
        showUsers: function (){
            this.MessageIn.User.Login = this.User.Login;
            this.MessageIn.User.Username = this.User.Username;
            this.MessageIn.Action = "GetUsers";
            this.ws.send(JSON.stringify(this.MessageIn))
        },
        createPublicGroup: function(){
            var modWin = document.getElementById('chat-messages');
            modWin.innerHTML = '<div id="modChange"></div>';
            var modWin = document.getElementById('modChange');
                if (typeof this.ContactList != "undefined") {
                    modWin.innerHTML = ' <div class="input-field white-text col s12"><input type="text" id="creatingGroup">\n' +
                        '            <label for="creatingGroup">Название группы</label></div>';
                    for (var i = 0; i < this.ContactList.length; i++) {
                        if (this.User.Login != this.ContactList[i].Login) {
                            modWin.innerHTML +=
                                '<div class="form-check">' +
                                '<input type="checkbox" class="form-check-input col s12"  id = ' +
                                this.ContactList[i].Login + '><label class="form-check-label" for=' +
                                this.ContactList[i].Login + '>'+
                                this.ContactList[i].Username +'</label>'+
                                '</div>' +
                                '<br/>';
                        }
                    }
                }
                modWin.innerHTML+= '<div class="input-field col s12">' +
                    '<button class="waves-effect waves-light btn col s12" onclick=createPubGroup()>' +
                    'Создать группу' +
                    '</button></div>' +
                    '<br/>';
            
        },
        search: function(){
            this.MessageIn.Action = "GetUsers";
            this.ws.send(JSON.stringify(this.MessageIn))
        },
        burger: function () {
            $('.menu').toggleClass('menu_opened');
            $(document).click(function(event) {
                if ($(event.target).closest(".burger_trigger").length ) return;
                $('.menu').removeClass('menu_opened');
                event.stopPropagation();
            });

        },
        openProfile: function(){
            this.ProfileStr.ProfileUser = this.User;
            this.profile = true;
        },
        showContacts: function(){
            this.MessageIn.User.Login = this.User.Login;
            this.MessageIn.User.Username = this.User.Username;
            this.MessageIn.Action = "GetContactList";
            this.ws.send(JSON.stringify(this.MessageIn))
        },
        changeUserFromProfile:function(){
            this.backtochat();
            var el = this.ProfileStr.ProfileGroupName;
            var net = true;
            var rgName = this.UsersFromServer[el].Login+this.User.Login;
            if(typeof this.GroupList != "undefined" || this.GroupList !=null){
                for (var i = 0; i < this.GroupList.length; i++) {
                    if (this.GroupList[i].GroupName == el || rgName == this.GroupList[i].GroupName) {
                        net = false;
                        break;
                    }
                }
            }
            if (net){
                this.MessageIn.Action = "CreateGroup"
                this.MessageIn.Group.GroupTypeID = 1;
                this.MessageIn.Group.User = this.User;
                this.MessageIn.Group.GroupOwnerID = this.User.ID;
                this.MessageIn.Group.GroupName = el;
                this.MessageIn.Members[0] = this.User;
                this.MessageIn.Members[1] = this.UsersFromServer[el];
                this.ws.send(JSON.stringify(this.MessageIn))
                this.$nextTick(function () {
                    var element = document.getElementById('groupList');
                    element.innerHTML += '<div class="input-field col s12">' +
                        '<button class="waves-effect waves-light btn col s12" onclick=changeUser(this) id = ' +
                        this.ProfileStr.ProfileGroupName + '>' +
                        this.UsersFromServer[this.ProfileStr.ProfileGroupName].Username +
                        '</button></div>' +
                        '<br/>';
                })
            }else{
                this.MessageIn.Group.GroupName =el ;
                this.RecContent = this.RecContents[el];
            }

        },

        AddContact:function(){
            this.MessageIn.Action = "AddContact";
            this.MessageIn.RelationType=1;
            this.MessageIn.Contact = this.ProfileStr.ProfileUser;
            test.ws.send(JSON.stringify(test.MessageIn));
        },
        backtochat: function(){
          this.profile = false;
        },
        showProfile: function(a){
            if(this.ContactList != "undefined"){
                for(var i=0;i<this.ContactList.length;i++){
                    if(this.ContactList[i].Login == this.UsersFromServer[a].Login){
                        this.Friend = true;
                    }
                    }
            }
            this.profile =true;
            this.ProfileStr.ProfileUser = this.UsersFromServer[a];
            this.ProfileStr.NotMy=true;
            this.ProfileStr.ProfileGroupName = a;
        },
        exit: function () {
            this.joined = false;
            location.reload();
        }
    }
});
function changeUser(el) {
    test.MessageIn.Group.GroupName =el.id;
    test.RecContent = test.RecContents[el.id];
}

function addGroupMember(el){
    test.MessageIn.Action = "AddGroupMember"
    test.ws.send(JSON.stringify(test.MessageIn))
}
function createPubGroup() {
    var el1 = document.getElementById('creatingGroup');
    test.MessageIn = {
            User: user,
            Contact: user,
            Group: group,
            Message: message,
            Members: [user],
            RelationType: 0,
            MessageLimit: 0,
            Action: '',
        };
    var chbox=[];
    var cout =0;
    if (typeof test.ContactList != "undefined") {
        for (var i = 0; i < test.ContactList.length; i++) {
            chbox[cout]=document.getElementById(test.ContactList[i].Login);
            
            if(chbox[cout] != null){
                cout++;
            }
        }
    }
    cout = 0;
    var accept = 0;
    for(var i =0;i<chbox.length-1; i++){
        if(chbox[i].checked){
            accept++;
            var user1 = {};
            user1.Login = chbox[i].id;
            console.log("sa",user1.Login);
            test.MessageIn.Members[cout] = user1;
            //test.MessageIn.Members[cout].Login = chbox[i].id;
            cout++;
        }
    }
    if(accept>0 && el1.value != null) {
        test.MessageIn.Members[test.MessageIn.Members.length] = test.User;
        test.MessageIn.Group.Members = test.MessageIn.Members;

        test.MessageIn.Action = "CreateGroup"
        test.MessageIn.Group.GroupTypeID = 2;
        test.MessageIn.Group.User = test.User;
        test.MessageIn.Group.GroupOwnerID = test.User.ID;
        test.MessageIn.Group.GroupName = el1.value;
        test.ws.send(JSON.stringify(test.MessageIn));
        var modWin = document.getElementById('chat-messages');
        modWin.innerHTML = '';
        var element = document.getElementById('groupList');
        element.innerHTML += '<div class="input-field col s12">' +
            '<button class="waves-effect waves-light btn col s12" onclick=changeUser(this) id = ' +
            test.MessageIn.Group.GroupName + '>' +
            test.MessageIn.Group.GroupName +
            '</button></div>' +
            '<br/>';
    }

}
function reftoshowProfile(el) {
    test.showProfile(el.id);
}