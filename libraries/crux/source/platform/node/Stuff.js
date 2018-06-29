
(function(lychee, global) {

	const _fs = require('fs');



	/*
	 * HELPERS
	 */

	const _STUFF_CACHE = {};

	const _clone_stuff = function(origin, clone) {

		if (origin.buffer !== null) {

			clone.buffer = origin.buffer;

			clone.__load = false;

		}

	};

	const _execute_stuff = function(callback) {

		let url    = this.url;
		let ignore = this.__ignore;

		if (url.endsWith('.js') && ignore === false) {

			// XXX: Used by BOOTSTRAP.js
			global.__FILENAME = url;


			let cid = lychee.environment.resolve(url);
			if (require.cache[cid] !== undefined) {
				delete require.cache[cid];
			}

			let result = false;
			try {
				require(cid);
				result = true;
			} catch (err) {
				lychee.Debugger.report(lychee.environment, err, this);
			}


			// XXX: Used by BOOTSTRAP.js
			global.__FILENAME = null;


			callback.call(this, result);

		} else {

			callback.call(this, true);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Stuff = function(url, ignore) {

		url    = typeof url === 'string' ? url : null;
		ignore = ignore === true;


		this.url      = url;
		this.onload   = null;
		this.buffer   = null;

		this.__ignore = ignore;
		this.__load   = true;


		if (url !== null) {

			if (_STUFF_CACHE[url] !== undefined) {
				_clone_stuff(_STUFF_CACHE[url], this);
			} else {
				_STUFF_CACHE[url] = this;
			}

		}

	};


	Stuff.prototype = {

		deserialize: function(blob) {

			if (typeof blob.buffer === 'string') {

				let tmp1 = blob.buffer.substr(blob.buffer.indexOf(',') + 1);
				let tmp2 = Buffer.from(tmp1, 'base64');

				this.buffer = tmp2.toString('utf8');
				this.__load = false;

			}

		},

		serialize: function() {

			let blob = {};
			let mime = 'application/octet-stream';


			if (this.url.endsWith('.js')) {
				mime = 'application/javascript';
			}


			if (this.buffer !== null) {

				let tmp = Buffer.from(this.buffer, 'utf8');

				blob.buffer = 'data:' + mime + ';base64,' + tmp.toString('base64');

			}


			return {
				'constructor': 'Stuff',
				'arguments':   [ this.url ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		load: function() {

			if (this.__load === false) {

				_execute_stuff.call(this, function(result) {

					if (this.onload instanceof Function) {
						this.onload(result);
						this.onload = null;
					}

				});


				return;

			}


			let path = lychee.environment.resolve(this.url);

			_fs.readFile(path, 'utf8', function(error, buffer) {

				if (typeof buffer === 'string') {

					this.buffer = buffer;
					this.__load = false;

					_execute_stuff.call(this, function(result) {

						if (this.onload instanceof Function) {
							this.onload(result);
							this.onload = null;
						}

					});

				} else {

					this.buffer = '';
					this.__load = false;

					if (this.onload instanceof Function) {
						this.onload(false);
						this.onload = null;
					}

				}

			}.bind(this));

		}

	};


	global.Stuff = Stuff;

})(lychee, global);

