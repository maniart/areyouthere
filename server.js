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


var lowThresh = 0;
var highThresh = 300;
var nIters = 1;
var maxArea = 2500;

var GREEN = [0, 255, 0]; //B, G, R
var WHITE = [255, 255, 255]; //B, G, R
var RED   = [0, 0, 255]; //B, G, R

// socket.io setup
io.on('connection', function(socket) {
	console.log('new socket connection');
	socket.on('image', function(data){
	    
	    imageBuffer = decodeBase64Image(data);
	    /*
	    cv.readImage(imageBuffer.data, function(err, im){
			if(err) throw err;
			im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
				//console.log('num of faces: ', faces.length);
				for (var i=0;i<faces.length; i++){
					var x = faces[i]
					im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
				}
				
				socket.volatile.emit('faceDetected', faces);
				socket.broadcast.volatile.emit('faceDetected', faces);
				console.log('Face detected and emitted.: ', faces);
			});
			
		});
		*/
		cv.readImage(imageBuffer.data, function(err, im) {

			var big = new cv.Matrix(im.height(), im.width()); 
			var all = new cv.Matrix(im.height(), im.width()); 

			im.convertGrayscale();
			im_canny = im.copy();

			im_canny.canny(lowThresh, highThresh);
			im_canny.dilate(nIters);

			contours = im_canny.findContours();

			for(i = 0; i < contours.size(); i++) {
				if(contours.area(i) > maxArea) {
					var moments = contours.moments(i);
					var cgx = Math.round(moments.m10/moments.m00);
					var cgy = Math.round(moments.m01/moments.m00);
					big.drawContour(contours, i, GREEN);
					big.line([cgx - 5, cgy], [cgx + 5, cgy], RED);
					big.line([cgx, cgy - 5], [cgx, cgy + 5], RED);
					//socket.broadcast.volatile.emit('outline', 'data:image/jpeg;base64,' + big.toBuffer().toString('base64'));
					socket.volatile.emit('outline', 'data:image/jpeg;base64,' + big.toBuffer().toString('base64').toString('base64'));
					//console.log(big.toBuffer().toString('base64'));
				}
			}

			all.drawAllContours(contours, WHITE);


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



