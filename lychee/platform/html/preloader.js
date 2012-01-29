
ly.preloader = function(urls, callback, scope) {

	if (Object.prototype.toString.call(urls) !== '[object Array]') {
		urls = [ urls ];
	}

	callback = callback || function() {};
	scope = scope || this;

	this.__callback = callback;
	this.__scope = scope;

	this.__index = {};
	this.__storage = new ly.storage('preloader', 'local');


	for (var u = 0, l = urls.length; u < l; u++) {

		var url = urls[u];
		if (url !== undefined && url !== null) {
			this.add(url);
		}

	}

};

ly.preloader.prototype = {

	add: function(url, type) {

		var tmp = url.split(/\./);
		type = type !== undefined ? type : tmp[tmp.length - 1];


		this.__checkLoop();

		if (this.__storage.get(url) === null) {

			this.__index[url] = false;

			ly.load(url, function(status, data) {

				if (status === 200) {
					var node = this.attach(type, data);
					this.__storage.set(url, data);

					this.__index[url] = true;
					this.__callback.call(this.__scope, 'progress', url, data, node);
                } else {
					this.__callback.call(this.__scope, 'failure', url, data);
				}

			}, this);

		} else {

			var data = this.__storage.get(url),
				node = this.attach(type, data);

			this.__index[url] = true;
			this.__callback.call(this.__scope, 'progress', url, data, node);

		}

	},

	attach: function(type, data) {

		var node;
		if (type === 'css') {

			node = document.createElement('style');
			node.setAttribute('type', 'text/css');
			node.innerHTML = data;
			document.head.appendChild(node);

		} else if (type === 'js') {

			node = document.createElement('script');
			node.setAttribute('type', 'text/javascript');
			node.innerHTML = data;
			document.head.appendChild(node);

		}

		return node !== undefined ? node : null;

	},

	__checkLoop: function() {

		if (this.__intervalId === undefined) {
			var that = this;
			this.__intervalId = setInterval(function() {
				that.__loop();
			}, 100);
		}

	},

	__loop: function() {

		var isReady = true;
		for (var i in this.__index) {
			if (this.__index[i] === false) {
				isReady = false;
			}
		}

		if (isReady === true) {

			clearInterval(this.__intervalId);
			delete this.__intervalId;

			this.__callback.call(this.__scope, 'ready');

		}

	}

};

