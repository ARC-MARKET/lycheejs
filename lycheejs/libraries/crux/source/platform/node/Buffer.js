
(function(lychee, global) {



	/*
	 * IMPLEMENTATION
	 */

	Buffer.prototype.serialize = function() {

		return {
			'constructor': 'Buffer',
			'arguments':   [ this.toString('base64'), 'base64' ]
		};

	};

	Buffer.prototype.map = function(callback) {

		callback = callback instanceof Function ? callback : null;


		let clone = Buffer.alloc(this.length);

		if (callback !== null) {

			for (let b = 0; b < this.length; b++) {
				clone[b] = callback(this[b], b);
			}

		} else {

			for (let b = 0; b < this.length; b++) {
				clone[b] = this[b];
			}

		}

		return clone;

	};


	global.Buffer = Buffer;

})(lychee, global);

