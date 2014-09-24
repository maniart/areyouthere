var areYouThere = (function(w, d, $) {

	// declare all vars
	var init,
		video,
		canvas,
		ctx,
		localMediaStream,
		socket,
		snapshot,
		imageData,
		attachListeners;

	// initialize all vars
	video = d.querySelector('#video');
	canvas = d.querySelector('canvas');
	ctx = canvas.getContext('2d');
	localMediaStream = null;
	socket = io();
	
	attachListeners = function() {
		socket.on("image", function(imageBuffer){
			//var buf = BinaryUtil.binaryToBase64(data.blob);
			var image = imageBuffer.data;
			/*
			if ($('#'+data.id).size() === 0) {
  				$("#body").append('<img id="'+ data.id +'" />');
			}
			$('#'+data.id).attr("src", buf);
			*/
			console.log('received this: ', imageBuffer.data);
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
			//var blob = BinaryUtil.base64ToBinary(img);
			$('#temp').attr('src', imageData);
			/*
			if(!printed) {
				console.log('img is: ', img);
				printed = true;
			}
			*/
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
		init : init
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