// declare all vars
var http,
	express,
	path,
	socketio,
	cv,
	fs,
	app,
	server,
	port,
	io,
	decodeBase64Image,
	imageBuffer;

// initialize imports
http = require('http');
express = require('express');
path = require('path');
socketio = require('socket.io');
cv = require('opencv');
fs = require('fs');

decodeBase64Image = function(dataString) {
	var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

	if (matches.length !== 3) {
		throw new Error('Invalid input string');
	}

	response.type = matches[1];
	response.data = new Buffer(matches[2], 'base64');

	return response;
};

// initialize the rest
app = express();
server = http.createServer(app);
io = socketio(server);
port = process.env.PORT || 3030;

// express static server
app.use(express.static(path.join(__dirname , 'static')));

// setup routes
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname , '/static/app.html'));
});

// socket.io setup
io.on('connection', function(socket) {
	console.log('new socket connection');
	socket.on('image', function(data){
	    //console.log('image >> \nid: ', socket.id);
	    //console.log(data);
	    imageBuffer = decodeBase64Image(data);
	    

	    /*
	    fs.writeFile(path.join(__dirname, 'tmp/tmp.jpg'), imageBuffer.data, function(err) {
	    	if(err) throw err;
	    	//console.log('The file was saved.');
	    });
		*/
		
	    //console.log('buffer is: ', buffer);
	    /*
	    socket.broadcast.volatile.emit('image', {
	    	id: socket.id,
	    	blob: data
	    });
	    */
	    

	    
	    cv.readImage(imageBuffer.data, function(err, im){
			if(err) throw err;
			im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
				//console.log('num of faces: ', faces.length);
				for (var i=0;i<faces.length; i++){
					var x = faces[i]
					im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
				}
				
				socket.volatile.emit('faceDetected', { imageBuffer : im });
				socket.broadcast.volatile.emit('faceDetected', { imageBuffer : im });
				console.log('Face detected and emitted.');
			});
			
			
			
		});
		
			


	    
	});
	socket.on("disconnect", function(){
    	socket.broadcast.emit("leave", {
      		id: socket.id
    	});
  	});
});

// http server setup
server.listen(port, function() {
	console.log('Are you there? running on port: ', port);
});



