
(function(lychee, global) {

	const _protocol = (function(location) {

		let origin   = location.origin || '';
		let protocol = origin.split(':')[0] || '';

		if (/^(http|https)$/g.test(protocol)) {
			return protocol;
		} else if (/^(file|chrome-extension)$/g.test(protocol)) {
			return 'file';
		} else {
			return null;
		}

	})(global.location || {});

	const _supports = (function() {

		let supports = {
			ogg: false,
			mp3: false
		};

		let audio = 'Audio' in global && typeof Audio !== 'undefined';
		if (audio === true) {

			let tmp = new Audio();

			[ 'application/ogg', 'audio/ogg', 'audio/ogg; codecs=theora, vorbis' ].forEach(variant => {

				if (tmp.canPlayType(variant)) {
					supports.ogg = true;
				}

			});

			[ 'audio/mpeg' ].forEach(variant => {

				if (tmp.canPlayType(variant)) {
					supports.mp3 = true;
				}

			});

			tmp = null;

		}

		return supports;

	})();



	/*
	 * HELPERS
	 */

	const _MUSIC_CACHE = {};

	const _clone_music = function(origin, clone) {

		if (origin.buffer !== null) {

			clone.buffer            = new Audio();
			clone.buffer.autobuffer = true;
			clone.buffer.preload    = true;
			clone.buffer.src        = origin.buffer.src;
			clone.buffer.load();

			clone.buffer.addEventListener('ended', _ => clone.play(), true);

			clone.__buffer.ogg = origin.__buffer.ogg;
			clone.__buffer.mp3 = origin.__buffer.mp3;
			clone.__load       = false;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Music = function(url) {

		url = typeof url === 'string' ? url : null;


		this.url      = url;
		this.onload   = null;
		this.buffer   = null;
		this.volume   = 1.0;
		this.isIdle   = true;

		this.__buffer = { ogg: null, mp3: null };
		this.__load   = true;


		if (url !== null) {

			if (_MUSIC_CACHE[url] !== undefined) {
				_clone_music(_MUSIC_CACHE[url], this);
			} else {
				_MUSIC_CACHE[url] = this;
			}

		}

	};


	Music.prototype = {

		deserialize: function(blob) {

			if (blob.buffer instanceof Object) {

				if (typeof blob.buffer.ogg === 'string') {

					let buffer = new Audio();

					buffer.addEventListener('ended', _ => this.play(), true);

					buffer.autobuffer = true;
					buffer.preload    = true;
					buffer.src        = blob.buffer.ogg;
					buffer.load();

					this.__buffer.ogg = buffer;

				}

				if (typeof blob.buffer.mp3 === 'string') {

					let buffer = new Audio();

					buffer.addEventListener('ended', _ => this.play(), true);

					buffer.autobuffer = true;
					buffer.preload    = true;
					buffer.src        = blob.buffer.mp3;
					buffer.load();

					this.__buffer.mp3 = buffer;

				}


				if (_supports.ogg === true) {
					this.buffer = this.__buffer.ogg || null;
				} else if (_supports.mp3 === true) {
					this.buffer = this.__buffer.mp3 || null;
				}

			}

		},

		serialize: function() {

			let blob = {};


			if (this.__buffer.ogg !== null || this.__buffer.mp3 !== null) {

				blob.buffer = {};

				if (this.__buffer.ogg !== null) {
					blob.buffer.ogg = 'data:application/ogg;base64,' + this.__buffer.ogg.toString('base64');
				}

				if (this.__buffer.mp3 !== null) {
					blob.buffer.mp3 = 'data:audio/mp3;base64,' + this.__buffer.mp3.toString('base64');
				}

			}


			return {
				'constructor': 'Music',
				'arguments':   [ this.url ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		load: function() {

			if (this.__load === false) {

				if (this.onload instanceof Function) {
					this.onload(true);
					this.onload = null;
				}

				return;

			}


			let url  = this.url;
			let type = null;

			if (_supports.ogg === true) {
				type = type || 'ogg';
			} else if (_supports.mp3 === true) {
				type = type || 'mp3';
			}


			if (url !== null && type !== null) {

				let buffer = new Audio();


				buffer.onloadedmetadata = function() {

					this.buffer         = buffer;
					this.__buffer[type] = buffer;

					this.__load = false;

					if (this.onload instanceof Function) {
						this.onload(true);
						this.onload = null;
					}

				}.bind(this);

				buffer.onloadeddata = function() {
					this.toString('base64');
				};

				// XXX: onerror is fired after onload -_-
				buffer.onerror = function() {

					if (this.buffer === buffer) {
						this.buffer         = null;
						this.__buffer[type] = null;
					}

					if (this.onload instanceof Function) {
						this.onload(false);
						this.onload = null;
					}

				}.bind(this);

				buffer.addEventListener('ended', _ => this.play(), true);

				buffer.autobuffer = true;
				buffer.preload    = true;


				let path = lychee.environment.resolve(url + '.' + type);
				if (path.startsWith('/opt/lycheejs') && _protocol !== null) {
					buffer.src = _protocol + '://' + path;
				} else {
					buffer.src = path;
				}


				buffer.load();

			} else {

				if (this.onload instanceof Function) {
					this.onload(false);
					this.onload = null;
				}

			}

		},

		clone: function() {
			return new Music(this.url);
		},

		play: function() {

			if (this.buffer !== null) {

				try {
					this.buffer.currentTime = 0;
				} catch (err) {
				}

				if (this.buffer.currentTime === 0) {

					let p = this.buffer.play();
					if (typeof p === 'object' && typeof p.catch === 'function') {
						p.catch(err => {});
					}

					this.isIdle = false;
				}

			}

		},

		pause: function() {

			if (this.buffer !== null) {
				this.buffer.pause();
				this.isIdle = true;
			}

		},

		resume: function() {

			if (this.buffer !== null) {

				let p = this.buffer.play();
				if (typeof p === 'object' && typeof p.catch === 'function') {
					p.catch(err => {});
				}

				this.isIdle = false;

			}

		},

		stop: function() {

			if (this.buffer !== null) {

				this.buffer.pause();
				this.isIdle = true;

				try {
					this.buffer.currentTime = 0;
				} catch (err) {
				}

			}

		},

		setVolume: function(volume) {

			volume = typeof volume === 'number' ? volume : null;


			if (volume !== null && this.buffer !== null) {

				volume = Math.min(Math.max(0, volume), 1);

				this.buffer.volume = volume;
				this.volume        = volume;

				return true;

			}


			return false;

		}

	};


	global.Music = Music;

})(this.lychee, this);

