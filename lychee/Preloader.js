
// Preloader is platform specific and required for lychee.Builder
(function(lychee, global) {

	var _instances = [];
	var _cache = {};


	var _globalIntervalId = null;
	var _globalInterval   = function() {

		var timedOutInstances = 0;

		for (var i = 0, l = _instances.length; i < l; i++) {

			var instance = _instances[i];
			var isReady  = true;

			for (var url in instance.__pending) {
				if (
					instance.__pending[url] === true
					|| _cache[url] === undefined
				) {
					isReady = false;
				}
			}


			var timedOut = false;
			if (instance.__clock !== null) {
				timedOut = Date.now() >= instance.__clock + instance.__timeout;
			}


			if (isReady === true || timedOut === true) {

				var errors = {};
				var ready  = {};
				var map    = {};

				for (var url in instance.__pending) {

					if (instance.__fired[url] === undefined) {

						if (instance.__pending[url] === false) {
							ready[url] = _cache[url] || null;
						} else {
							errors[url] = null;
						}

						map[url] = instance.__map[url] || null;
						instance.__fired[url] = true;

					}

				}


				if (Object.keys(errors).length > 0) {
					instance.trigger('error', [ errors, map ]);
				}


				if (Object.keys(ready).length > 0) {
					instance.trigger('ready', [ ready, map ]);
				}


				// Reset the clock if the lychee.Preloader timed out
				if (timedOut === true) {
					timedOutInstances++;
				}

			}

		}


		if (timedOutInstances === _instances.length) {

			if (lychee.debug === true) {
				console.log('lychee.Preloader: Nothing to do, switching to idle mode.');
			}

			for (var i = 0, l = _instances.length; i < l; i++) {
				_instances[i].__clock = null;
			}

			global.clearInterval(_globalIntervalId);
			_globalIntervalId = null;

		}

	};


	var Class = function(data) {

		var settings = lychee.extend({}, data);

		settings.timeout  = typeof settings.timeout === 'number' ? settings.timeout : this.defaults.timeout;


		this.__timeout  = settings.timeout;

		this.__events  = {};
		this.__fired   = {}; // cached fired events per request
		this.__map     = {}; // associated data per request
		this.__pending = {}; // pending requests
		this.__clock   = null;


		_instances.push(this);


		settings = null;

	};


	Class.prototype = {

		defaults: {
			timeout: 3000
		},



		/*
		 * EVENT BINDINGS
		 *
		 * (not using lychee.event.Emitter
		 *  due to no-dependency
		 *  reasons)
		 */

		bind: function(event, callback, scope) {

			event = typeof event === 'string' ? event : null;
			callback = callback instanceof Function ? callback : null;
			scope = scope !== undefined ? scope : this;


			if (event !== null && callback !== null) {

				this.__events[event] = {
					callback: callback,
					scope: scope
				};

			}

		},

		unbind: function(event) {

			event = typeof event === 'string' ? event : null;


			if (event !== null && this.__events[event] !== undefined) {
				delete this.__events[event];
				return true;
			}


			return false;

		},

		trigger: function(event, args) {

			args = Object.prototype.toString.call(args) === '[object Array]' ? args : [];


			if (this.__events[event] !== undefined) {
				this.__events[event].callback.apply(this.__events[event].scope, args);
				return true;
			}


			return false;

		},



		/*
		 * PUBLIC API
		 */

		load: function(urls, map, forced) {

			urls = typeof urls === 'string' ? [ urls ] : urls;
			map = map !== undefined ? map : null;
			forced = typeof forced === 'string' ? forced : null;


			if (Object.prototype.toString.call(urls) !== '[object Array]') {
				return false;
			}


			this.__clock = Date.now();


			// 1. Load the assets via platform-specific APIs
			for (var u = 0, l = urls.length; u < l; u++) {

				var url = urls[u];
				var tmp = url.split(/\./);


				if (this.__pending[url] === undefined) {

					if (map !== null) {
						this.__map[url] = map;
					}


					// 1.1 Check if another lychee.Preloader
					// instance already loaded the requested
					// URL to the shared cache.

					if (_cache[url] != null) {

						this.__pending[url] = false;

					} else {

						if (forced !== null) {
							this._load(url, forced, _cache);
						} else {
							this._load(url, tmp[tmp.length - 1], _cache);
						}

					}

				}

			}


			// 2. Start the global interval
			if (_globalIntervalId === null) {
				_globalIntervalId = global.setInterval(function() {
					_globalInterval();
				}, 100);
			}

		},

		get: function(url) {

			if (_cache[url] !== undefined) {
				return _cache[url];
			}


			return null;

		},



		/*
		 * PLATFORM-SPECIFIC Implementation
		 */

		_load: function(url, type, _cache) {
			throw "lychee.Preloader: You need to include the platform-specific bootstrap.js to load other files.";
		},

		_progress: function(url, _cache) {
		}

	};


	lychee.Preloader = Class;

})(lychee, typeof global !== 'undefined' ? global : this);

