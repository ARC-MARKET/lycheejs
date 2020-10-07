
(function(lychee, global) {

	const _fs = require('fs');



	/*
	 * HELPERS
	 */

	const _MUSIC_CACHE = {};

	const _clone_music = function(origin, clone) {

		if (origin.__buffer.ogg !== null || origin.__buffer.mp3 !== null) {

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
		this.volume   = 0.0;
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

					let tmp = blob.buffer.ogg.substr(blob.buffer.ogg.indexOf(',') + 1);

					this.__buffer.ogg = Buffer.from(tmp, 'base64');

				}

				if (typeof blob.buffer.mp3 === 'string') {

					let tmp = blob.buffer.mp3.substr(blob.buffer.mp3.indexOf(',') + 1);

					this.__buffer.mp3 = Buffer.from(tmp, 'base64');

				}


				this.__load = false;

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


			let path_ogg = lychee.environment.resolve(this.url + '.ogg');
			let path_mp3 = lychee.environment.resolve(this.url + '.mp3');

			_fs.readFile(path_ogg, (error_ogg, buffer_ogg) => {

				_fs.readFile(path_mp3, (error_mp3, buffer_mp3) => {

					this.__buffer.ogg = buffer_ogg || null;
					this.__buffer.mp3 = buffer_mp3 || null;
					this.__load       = false;

					if (this.onload instanceof Function) {
						this.onload(buffer_ogg !== null || buffer_mp3 !== null);
						this.onload = null;
					}

				});

			});

		},

		clone: function() {
			return new Music(this.url);
		},

		play: function() {
			this.isIdle = false;
		},

		pause: function() {
			this.isIdle = true;
		},

		resume: function() {
			this.isIdle = false;
		},

		stop: function() {
			this.isIdle = true;
		},

		setVolume: function(volume) {

			volume = typeof volume === 'number' ? volume : null;


			return false;

		}

	};


	global.Music = Music;

})(lychee, global);

