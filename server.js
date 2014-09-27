// declare all vars
var http,
	express,
	path,
	socketio,
	cv,
	app,
	server,
	port,
	io,
	faceCount,
	decodeBase64Image,
	imageBuffer,
	distanceThreshold,
	prevWidth,
	totalFaceCount;

// initialize imports
http = require('http');
express = require('express');
path = require('path');
socketio = require('socket.io');
cv = require('opencv');

// initialize the rest
app = express();
server = http.createServer(app);
io = socketio(server);
port = process.env.PORT || 3030;
prevWidth = null;
faceCount = 0;
totalFaceCount = 0;
distanceThreshold = 8;
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
	    
	    imageBuffer = decodeBase64Image(data);
	    
	

	    cv.readImage(imageBuffer.data, function(err, im){
			if(err) throw err;
			im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
				//console.log('num of faces: ', faces.length);
				if(faces.length > faceCount) {
					totalFaceCount += Math.abs(faceCount - faces.length);
					faceCount = faces.length;
					socket.volatile.emit('faceAdded', [faceCount, totalFaceCount]);
					socket.broadcast.volatile.emit('faceAdded', faceCount);	
					console.log('Face added. Current # : ', [faceCount, totalFaceCount]);
				} else if(faces.length < faceCount){
					faceCount = faces.length;
					socket.volatile.emit('faceRemoved', [faceCount, totalFaceCount]);
					socket.broadcast.volatile.emit('faceRemoved', [faceCount, totalFaceCount]);	
					console.log('Face removed. Current # : ', [faceCount, totalFaceCount]);
				}
				if(faces.length === 1) {
					if(null === prevWidth) {
						prevWidth = faces[0].width;
					} else {
						var diffWidth = faces[0].width - prevWidth;
						if(Math.abs(diffWidth) >= distanceThreshold ) {
							if(diffWidth > 0) {
								socket.volatile.emit('closer');
								socket.broadcast.volatile.emit('closer');	
								prevWidth = null;
							} else {
								socket.volatile.emit('farther');
								socket.broadcast.volatile.emit('farther');	
								prevWidth = null;
							}

						}
					}
				}
				if(faces.length === 0) {
					prevWidth = null;
				}
				for (var i=0;i<faces.length; i++){
					var x = faces[i]
					console.log(x);
					//im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
				}
				if(faces.length > 0) {
					socket.volatile.emit('faceDetected', faces);
					socket.broadcast.volatile.emit('faceDetected', faces);	
				}
				//console.log('Face detected and emitted.');
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



