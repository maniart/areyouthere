var areYouThere = (function(w, d, $) {

	// declare all vars
	var init,
		video,
		canvas,
		outline,
		outlineCtx,
		ctx,
		localMediaStream,
		socket,
		snapshot,
		imageData,
		attachListeners;

	// initialize all vars
	video = d.querySelector('#video');
	canvas = d.querySelector('#source');
	drawing = d.querySelector('#drawing');
	outline = d.querySelector('#outline');
	ctx = canvas.getContext('2d');
	outlineCtx = outline.getContext('2d');
	
	drawingCtx = drawing.getContext('2d');
	drawingCtx.fillStyle = "rgb(200,0,0)";
	localMediaStream = null;
	socket = io();
	
	attachListeners = function() {
		socket.on('connect', function() {
			console.log('connected');
			socket.on('faceDetected', function(imageBuffer){
				drawingCtx.beginPath();
				for(var i = 0; i < imageBuffer.length; i += 1) {
					//drawingCtx.fillRect(drawing.width - imageBuffer[i].x, drawing.height - imageBuffer[i].y, 10, 10);
					drawingCtx.beginPath();
					drawingCtx.arc(drawing.width - (drawing.width - imageBuffer[i].x), drawing.height - (drawing.height - imageBuffer[i].y), 10, 0, 2 * Math.PI, false);
					drawingCtx.fillStyle = 'rgba(200, 200, 20, .3)';
					drawingCtx.fill();
				}
			});
			socket.on('outline', function(imageBuffer) {
				console.log('outline: >> ', imageBuffer);
				var img = new Image();
				img.src = imageBuffer;
				outlineCtx.drawImage(img, 0, 0);
			});
		});
		
		video.addEventListener('timeupdate', function(e){
			snapshot();
		});
		UserMedia.onSuccess = function(stream) {
			video.src = window.URL.createObjectURL(stream);
			localMediaStream = stream;
			snapshot();

		};
		UserMedia.onError = function(e) {
			console.log("Error ", e);
		};
  
	};

	snapshot = function() {
		if (localMediaStream) {
			ctx.drawImage(video, 0, 0);
			imageData = canvas.toDataURL('image/jpeg');
			socket.emit("image", imageData);
		}
	};

	init = function() {

		UserMedia.check();
		attachListeners();
		UserMedia.play();

		console.log('Are You There?\nDUMBO Arts Festival 2014');
  
	};

	return {
		init : init,
		socket : socket
	}

}(window, document, jQuery));

// kick off the module on document ready event
jQuery(document).ready(function() {
	
	try {
		areYouThere.init();
	} catch(e) {
		console.log('Failed to initialize areYouThere module: ', e);
	}

});