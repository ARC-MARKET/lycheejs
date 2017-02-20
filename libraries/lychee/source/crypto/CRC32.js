
lychee.define('lychee.crypto.CRC32').exports(function(lychee, global, attachments) {

	const _CRC_TABLE = (function(table) {

		let value = 0;

		for (let t = 0, tl = table.length; t < tl; t++) {

			value = t;

			value = ((value & 1) ? (-306674912 ^ (value >>> 1)) : (value >>> 1));
			value = ((value & 1) ? (-306674912 ^ (value >>> 1)) : (value >>> 1));
			value = ((value & 1) ? (-306674912 ^ (value >>> 1)) : (value >>> 1));
			value = ((value & 1) ? (-306674912 ^ (value >>> 1)) : (value >>> 1));
			value = ((value & 1) ? (-306674912 ^ (value >>> 1)) : (value >>> 1));
			value = ((value & 1) ? (-306674912 ^ (value >>> 1)) : (value >>> 1));
			value = ((value & 1) ? (-306674912 ^ (value >>> 1)) : (value >>> 1));
			value = ((value & 1) ? (-306674912 ^ (value >>> 1)) : (value >>> 1));

			table[t] = value;

		}

		return table;

	})(new Array(256));



	/*
	 * HELPERS
	 */

	const _bytes_to_value = function(buffer) {

		let value = -1;

		for (let b = 0; b < buffer.length; b++) {
			value = _CRC_TABLE[(value ^ buffer[b]) & 0xff] ^ (value >>> 8);
		}

		return value ^ -1;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function() {

		this.__crc = 0;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'lychee.crypto.CRC32',
				'arguments':   []
			};

		},



		/*
		 * CRYPTO API
		 */

		update: function(data) {

			data = data instanceof Buffer ? data : new Buffer(data, 'utf8');


			this.__crc = _bytes_to_value(data);

		},

		digest: function() {

			let hash = (this.__crc >>> 0).toString(16);
			if (hash.length % 2 === 1) {
				hash = '0' + hash;
			}

			return new Buffer(hash, 'hex');

		}

	};


	return Composite;

});

