var areYouThere = (function(w, d, $) {

	// declare all vars
	var init,
		video,
		source,
		ctx,
		localMediaStream,
		socket,
		snapshot,
		imageData,
		output,
		attachListeners;

	// initialize all dem vars
	localMediaStream = null;
	socket = io();


	video = d.querySelector('#video');
	source = d.querySelector('#source');
	drawing = d.querySelector('#drawing');
	
	ctx = source.getContext('2d');
	
	output = d.querySelector('#output');
	outputCtx = output.getContext('2d');


	drawingCtx = drawing.getContext('2d');
	drawingCtx.fillStyle = "rgb(200,0,0)";
	
	outputCtx.translate(output.width, 0);
	outputCtx.scale(-1, 1);
	

	
	
	attachListeners = function() {
		socket.on('connect', function() {
			console.log('socket.io >> connected');
			socket.on('faceDetected', function(imageBuffer){
				outputCtx.beginPath();
				for(var i = 0; i < imageBuffer.length; i += 1) {					
					outputCtx.clearRect(0,0,output.width, output.height);
					outputCtx.beginPath();
					outputCtx.arc((2.9 * imageBuffer[i].x), 2.84 * (output.height - (output.height - imageBuffer[i].y)), imageBuffer[i].height, 0, 2 * Math.PI, false);
					outputCtx.fillStyle = 'rgba(200, 200, 20, 1)';
					outputCtx.fill();

				}
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
			
			imageData = source.toDataURL('image/jpeg');
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