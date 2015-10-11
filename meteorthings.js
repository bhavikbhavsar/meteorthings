Messages = new Meteor.Collection("messages");
Rooms = new Meteor.Collection("rooms");

Leds = new Array("led1", "led2", "led3", "led4");
Cmds = new Array("on", "off", "status");
Greeting = new Array("morning", "afternoon", "evening");

if (Meteor.isClient) {
  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });

  Meteor.subscribe("rooms");
  Meteor.subscribe("messages");
  Session.setDefault("roomname", "Living Room");

  Template.input.events({
    'click .sendMsg': function(e) {
       _sendMessage();
    },
    'keyup #msg': function(e) {
      if (e.type == "keyup" && e.which == 13) {
        _sendMessage();
      }
    }
  });

	
  _sendMessage = function() {
    var el = document.getElementById("msg");
    Messages.insert({user: Meteor.user().username, msg: el.value, ts: new Date(), room: Session.get("roomname")});
		
		var command = el.value.split(" ");
		
		if (command.length == 2) {			
			if (command[0].toLowerCase() == "good") {
				if (Greeting.indexOf(command[1].toLowerCase()) == -1) {
					Messages.insert({user: "IOT", msg: "Wrong greeting", ts: new Date(), room: Session.get("roomname")});											
				} else {
					Messages.insert({user: "IOT", msg: el.value + ", " + Meteor.user().username, ts: new Date(), room: Session.get("roomname")});																
				}
			} else {
				
				if (Leds.indexOf(command[0].toLowerCase()) == -1) {
					Messages.insert({user: "IOT", msg: "Wrong device", ts: new Date(), room: Session.get("roomname")});						
				} else if (Cmds.indexOf(command[1].toLowerCase()) == -1) {
					Messages.insert({user: "IOT", msg: "Wrong command", ts: new Date(), room: Session.get("roomname")});									
				} else {
					
					HTTP.post( 'http://192.168.2.2:3000', { data: { "device": command[0], "command": command[1]} }, function(error, response) {
						if ( error ) {
							console.log( error );
						} else {
							console.log( response );

							//if (command[1].toLowerCase() == "status") {
								Messages.insert({user: "IOT", msg: response.content, ts: new Date(), room: Session.get("roomname")});			
							//}
				
						}
					} );
					
				}

			};
			
		} else {
				Messages.insert({user: "IOT", msg: "Wrong format", ts: new Date(), room: Session.get("roomname")});									
		}
    el.value = "";
    el.focus();
  };

  Template.messages.helpers({
    messages: function() {
      return Messages.find({room: Session.get("roomname")}, {sort: {ts: -1}});
    },
	roomname: function() {
      return Session.get("roomname");
    }
  });
  
  Template.message.helpers({
    timestamp: function() {
      return this.ts.toLocaleString();
    }
  });

  Template.rooms.events({
    'click li': function(e) {
      Session.set("roomname", e.target.innerText);
    }
  });
  
  Template.rooms.helpers({
    rooms: function() {
      return Rooms.find();
    }
  });
  
  Template.room.helpers({
	roomstyle: function() {
      return Session.equals("roomname", this.roomname) ? "font-weight: bold" : "";
    }
  });

  Template.chat.helpers({
    release: function() {
      return Meteor.release;
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Messages.remove({});
    Rooms.remove({});
    if (Rooms.find().count() === 0) {
      ["Living Room", "Kitchen", "Master Bedroom", "Guest Room", "Store Room"].forEach(function(r) {
        Rooms.insert({roomname: r});
      });
    }
  });
  
  Rooms.deny({
    insert: function (userId, doc) {
      return true;
    },
    update: function (userId, doc, fieldNames, modifier) {
      return true;
    },
    remove: function (userId, doc) {
      return true;
    }
  });
  Messages.deny({
    insert: function (userId, doc) { return (userId === null); },
    update: function (userId, doc, fieldNames, modifier) {
      return true;
    },
    remove: function (userId, doc) { return true; }
  });
  Messages.allow({
    insert: function (userId, doc) {
      return (userId !== null);
    }
  });
  
  Meteor.publish("rooms", function () {
    return Rooms.find();
  });
  Meteor.publish("messages", function () {
    return Messages.find({}, {sort: {ts: -1}});
  });
}
