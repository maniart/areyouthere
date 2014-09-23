var cv = require('opencv');
var http = require('http');
var events = require('events');
var ev = new events.EventEmitter();
var camera = new cv.VideoCapture(0);
var i = 0;

http.createServer(function(req, res) {


	res.writeHead(200, {'Content-Type' : 'text/html'});
	ev.on('cam:newImage', function(im) {

		//console.log(im.toBuffer());
		//res.open();
		res.writeHead(200, {'Content-Type': 'image/jpeg'});  
	  	res.write(im.toBuffer());  
		res.end();
		//res.end('<!doctype html><html><head></head><body><img src="tmp/cam1.png"></body></html>');
		//console.log('src: ', __dirname +'/'+ path);
	});

	setInterval(function() {
		camera.read(function(err, im) {
			if(err) { throw err; }
			var path = 'tmp/cam' + i + '.png';
			im.save(path);
			ev.emit('cam:newImage', im);
			i ++;
		});
	}, 500);


	
		
		
}).listen(9999);




