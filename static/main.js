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
		fade,
		output,
		draw,
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
	
	var alpha = 0;
	fade = function(direction) {
		
		if(direction === 'in') {
			requestAnimFrame(function() {
				while(alpha < 1) {
					alpha += .0001;
				}
			});
			
		} else if(direction === 'out') {
			alpha = 1;
			requestAnimFrame(function() {
				while(alpha > 0) {
					alpha -= .0001;
				}
			});
		} else {
			throw new Error('Valid arguments are : \'in\' and \'out\'');
		}
		//return alpha;
	};

	var check = false;

	draw = function(imageBuffer) {
		// clear the stage
		outputCtx.clearRect(0, 0, output.width, output.height);
		outputCtx.save();
		// draw white rectangle
        outputCtx.rect(0, 0, output.width, output.width);
        outputCtx.fillStyle = 'white';
        outputCtx.fill();
        outputCtx.fillStyle = 'rgba(200, 200, 20,' + alpha + ')';
		for(var i = 0; i < imageBuffer.length; i += 1) {					
			
        	// set the composite operation
			outputCtx.globalCompositeOperation = 'destination-out';	
	        // draw the hole
			outputCtx.beginPath();
			outputCtx.arc((2.9 * imageBuffer[i].x), (2.84 * imageBuffer[i].y), imageBuffer[i].height, 0, 2 * Math.PI, false);
			
			outputCtx.fill();

			outputCtx.restore();

		}
		requestAnimFrame(function() {
			draw(imageBuffer);
		});		
	};
	
	attachListeners = function() {
		socket.on('connect', function() {
			console.log('socket.io >> connected');
			socket.on('faceDetected', function(imageBuffer){
				requestAnimFrame(function() {
					draw(imageBuffer);
				});		
			});

		});
		socket.on('faceAdded', function(faceCount) {
			console.log('Face added. # : ', faceCount);
		});
		socket.on('faceRemoved', function(faceCount) {
			console.log('Face removed. # : ', faceCount);
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
		fade : fade
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