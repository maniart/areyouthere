var app,
	express,
	server,
	path,
	webRTC,
	port;

express = require('express');
path = require('path');
app = express();
server = require('http').createServer(app);
webRTC = require('webrtc.io').listen(server);
port = process.env.PORT || 9001;

server.listen(port, function() {
	console.log('Are you there? running on port: ', port);
});

app.use(express.static(path.join(__dirname , 'static')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname , '/static/app.html'));
});

webRTC.rtc.on('chat_msg', function(req, res) {
	var roomList = webRTC.rtc.rooms[data.room] || [];
	for(var i; i < roomList.length; i++) {
		var socketID = roomList[i];
		if(socketID !== socket.id) {
			var soc = webRTC.rtc.getSocket(socketID);
			if(soc) {
				soc.send(JSON.stringify({
					"eventName" : "receive_chat_msg",
					"data" : {
						"messages" : data.messages,
						"color" : data.color
					}
				}), function(error) {
					if(error) {
						throw error;
					}
				});
			}
		}
	}
});