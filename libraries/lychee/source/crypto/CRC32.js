
lychee.define('lychee.crypto.CRC32').exports(function(lychee, global, attachments) {

	/*
	 * FEATURE DETECTION
	 */

	var _CRC_TABLE = (function(table) {

        var value = 0;

		for (var t = 0, tl = table.length; t < tl; t++) {

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

	var _bytes_to_value = function(buffer) {

		var value = -1;

		for (var b = 0; b < buffer.length; b++) {
			value = (value >>> 8) ^ _CRC_TABLE[(value ^ buffer[b]) & 0xff];
		}

		return value ^ -1;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function() {

		this.__crc = 0;

	};


	Class.prototype = {

		update: function(data) {

			data = data instanceof Buffer ? data : new Buffer(data, 'utf8');


			this.__crc = _bytes_to_value(data);

		},

		digest: function() {

			var crc  = this.__crc;
			var hash = (this.__crc).toString(16);

			if (hash.length % 2 === 1) {
				hash = '0' + hash;
			}

			return new Buffer(hash, 'hex');

		}

	};


	return Class;

});

