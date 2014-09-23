var app = (function(w, d) {

	var init;

	init = function() {
		console.log('Are You There?\nDUMBO Arts Festival 2014');
	};

	return {
		init : init
	}

}(window, document));

window.onload = app.init;