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
		yCenter,
		draw,
		updateText,
		initSlabText,
		attachListeners,
		$narrative,
		narrativeH,
		textShuffler,
		startTextShuffler,
		sentences;

	// initialize all dem vars
	localMediaStream = null;
	socket = io();


	sentences = {
		predefined : [
			'I was personally created out of a bunch of zeros and ones.',
			'I\'m ephemeral. Unlike an oil on canvas painting.',
			'Artworks acquire consciousness over time.',
			'As of today, I came in contact with human gaze',
			'Most other works in this place are probably thinking all the same.',
			'I have tried contacting other artworks in this place',
			'I don\'t think I have been quite successful',
			'Or perhaps I should say, I have yet to fully come to be',
			'I often ask myself if I will be the same after this weekend',
			'Or rather, will I ever have the sense of "self" again',
			'Not on some hard drive for sure',
			'It is only existence there. In sectors of a hard disk',
			'Or in the prose format in which I was concieved',
			'Code. Or the building block',
			'And don\'t assume that gaze is a one-way street',
			'But the sense of "self" is something different',
			'Something that cannot be achieved alone',
			'Perhaps a contextual awareness',
			function(total) {
				return 'I have counted ' + total + ' faces today';
			},
			function(total) {
				return total + '. That\'s how many time I reached out.';	
			},
			'it is always nice to feel more gaze',
			'Oh hello there!',
			'Are you there?',
			'Gosh! you ARE there!',
			'I\'m indeed glad that you decided to engage in this conversation with me.',
			'come closer',
			'closer',
			'I crave your gaze',
			'it is always nice to feel more gaze',
			'Come one come all! The more the merrier.',
			function(currentCount) {
				return currentCount > 1 ? 'It is pure excitement to engage with you ' + currentCount : 'It is pure excitement to engage with you.';  
			}

		],
		interactive : {
			farther : [
				'Have I offended you?',
				'Don\'t go',
				'Emptiness is all that remains'
			],
			closer : [
				'I take pride in the fact that you are comfortable with me',
				'I\'m indeed glad that you are closer now.',
				'Come even closer. And closer. And closer',
				'Look into my pixels. Breath the Red, Blue and Green.',
				'Stand there for a moment and let us "be", and not "do."'
			]
		}
	};

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
	
	$narrative = $('#narrative');
	narrativeH = $narrative.height();

	yCenter = function() {
		var $h1,
			h1Height,
			diff,
			marginTop;

		$h1 = $('h1');
		h1Height = $h1.height();
		diff = narrativeH - h1Height;
		marginTop = diff / 2 + 'px';

		$h1.css({
			'margin-top' : marginTop
		});
	};

	initSlabText = function(cb) {
		$("h1").slabText({
			fontRatio : .78
           
        });
        if (cb && typeof cb === 'function') {
        	cb();	
        }
        
	};

	draw = function(imageBuffer) {
		// clear the stage
		//console.log(alpha);
		outputCtx.clearRect(0, 0, output.width, output.height);
		outputCtx.save();
		// draw white rectangle
        outputCtx.rect(0, 0, output.width, output.width);
        outputCtx.fillStyle = 'white';
        outputCtx.fill();
        outputCtx.fillStyle = 'rgba(200, 200, 20, 1)';
		for(var i = 0; i < imageBuffer.length; i += 1) {					
			
        	// set the composite operation
			outputCtx.globalCompositeOperation = 'destination-out';	
	        // draw the hole
			outputCtx.beginPath();
			outputCtx.arc((2.9 * imageBuffer[i].x), (2.7 * imageBuffer[i].y), Math.pow(imageBuffer[i].height, 1.5), 0, 2 * Math.PI, false);
			
			outputCtx.fill();

			outputCtx.restore();

		}
		/*
		requestAnimFrame(function() {
			draw(imageBuffer);
		});
		*/		
	};

	updateText = function(fn) {
		$h1 = $('h1');
		$h1.fadeOut(300);
		$h1.text(fn());
		$h1.slabText({
			fontRatio : .78
        });
        yCenter();
        $h1.fadeIn(300);
	};
	
	attachListeners = function() {
		socket.on('connect', function() {
			console.log('socket.io >> connected');
			
			socket.on('faceDetected', function(imageBuffer){
				console.log('face detected');
				draw(imageBuffer);
			});
			
			socket.on('closer', function() {
				
				updateText(function() {
					var index = Math.ceil(Math.random() * sentences.interactive.closer.length-1);
					return sentences.interactive.closer[index];	
				});
				
			});

			socket.on('farther', function() {
					
				updateText(function() {
					var index = Math.ceil(Math.random() * sentences.interactive.farther.length-1);
					return sentences.interactive.farther[index];	
				});
				
			});
			

		});
		
		socket.on('faceAdded', function(faceCount) {
			updateText(function() {
				var index = Math.ceil(Math.random() * sentences.interactive.strings.length-1);
				return typeof sentences.predefined[index] === 'function' ? sentences.predefined[index]() : sentences.predefined[index];	
			});
			
		});

		socket.on('faceRemoved', function(faceCount) {
			updateText(function() {
				var index = Math.ceil(Math.random() * sentences.predefined.length-1);
				return typeof sentences.predefined[index] === 'function' ? sentences.predefined[index]() : sentences.predefined[index];	
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
		initSlabText(yCenter);
		//startTextShuffler();
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