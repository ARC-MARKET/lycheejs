
if (!this.ly) {
	this.ly = {};
}



// Aliasing crashes V8 :-/
this.requestAniFrame = (function(global) {

	return (
		global.requestAnimationFrame
		|| global.msRequestAnimationFrame
		|| global.mozRequestAnimationFrame
		|| global.oRequestAnimationFrame
		|| global.webkitRequestAnimationFrame
		|| function(callback, element) {
			global.setTimeout(callback, 1000 / 60);
		}
	);

})(this);


if (typeof Date.now !== 'function') {
	Date.now = function() {
		return +new Date();
	};
}


ly.extend = function(obj) {

	for (var a = 1, al = arguments.length; a < al; a++) {

		var obj2 = arguments[a];
		if (obj2) {

			for (var prop in obj2) {
				obj[prop] = obj2[prop];
			}

		}

	}


	return obj;

};


ly.load = function(url, callback, scope) {

	if (typeof url !== 'string') return;

	callback = typeof callback === 'function' ? callback : null;
	scope = scope || window;

	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);

	if (url.match(/\.json/)) {
		xhr.setRequestHeader('Content-Type', 'application/json; charset=utf8');
	}

	if (callback !== null) {

		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				callback.call(scope, xhr.status, xhr.responseText || xhr.responseXML);
			}
		};

		xhr.send(null);

	} else {
		return xhr.send(null);
	}

};

