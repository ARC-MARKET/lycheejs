
lychee.define('lychee.crypto.MD5').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	const _bytes_to_words = function(bytes) {

		let words = [];

		for (let i = 0, b = 0; i < bytes.length; i++, b += 8) {
			words[b >>> 5] |= bytes[i] << (24 - b % 32);
		}

		return words;

	};

	const _words_to_bytes = function(words) {

		let bytes = [];

		for (let b = 0; b < words.length * 32; b += 8) {
			bytes.push((words[b >>> 5] >>> (24 - b % 32) & 0xff));
		}

		return bytes;

	};

	const _md5_FF = function (a, b, c, d, x, s, t) {

		let n = a + (b & c | ~b & d) + (x >>> 0) + t;

		return ((n << s) | (n >>> (32 - s))) + b;

	};

	const _md5_GG = function (a, b, c, d, x, s, t) {

		let n = a + (b & d | c & ~d) + (x >>> 0) + t;

		return ((n << s) | (n >>> (32 - s))) + b;

	};

	const _md5_HH = function (a, b, c, d, x, s, t) {

		let n = a + (b ^ c ^ d) + (x >>> 0) + t;

		return ((n << s) | (n >>> (32 - s))) + b;

	};

	const _md5_II = function (a, b, c, d, x, s, t) {

		let n = a + (c ^ (b | ~d)) + (x >>> 0) + t;

		return ((n << s) | (n >>> (32 - s))) + b;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function() {

		this.__a = 1732584193;
		this.__b = -271733879;
		this.__c = -1732584194;
		this.__d = 271733878;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'lychee.crypto.MD5',
				'arguments':   []
			};

		},



		/*
		 * CRYPTO API
		 */

		update: function(data) {

			data = data instanceof Buffer ? data : new Buffer(data, 'utf8');


			let words = _bytes_to_words(data);
			let length = data.length * 8;
			let a      = 1732584193;
			let b      = -271733879;
			let c      = -1732584194;
			let d      = 271733878;
			let w      = 0;


			for (w = 0; w < words.length; w++) {

				words[w] = ((words[w] <<  8) | (words[w] >>> 24)) & 0x00FF00FF
						 | ((words[w] << 24) | (words[w] >>>  8)) & 0xFF00FF00;

			}

			words[length >>> 5] |= 0x80 << (length % 32);
			words[(((length + 64) >>> 9) << 4) + 14] = length;


			for (w = 0; w < words.length; w += 16) {

				let aa = a;
				let bb = b;
				let cc = c;
				let dd = d;


				a = _md5_FF(a, b, c, d, words[w +  0],  7, -680876936);
				d = _md5_FF(d, a, b, c, words[w +  1], 12, -389564586);
				c = _md5_FF(c, d, a, b, words[w +  2], 17,  606105819);
				b = _md5_FF(b, c, d, a, words[w +  3], 22, -1044525330);
				a = _md5_FF(a, b, c, d, words[w +  4],  7, -176418897);
				d = _md5_FF(d, a, b, c, words[w +  5], 12,  1200080426);
				c = _md5_FF(c, d, a, b, words[w +  6], 17, -1473231341);
				b = _md5_FF(b, c, d, a, words[w +  7], 22, -45705983);
				a = _md5_FF(a, b, c, d, words[w +  8],  7,  1770035416);
				d = _md5_FF(d, a, b, c, words[w +  9], 12, -1958414417);
				c = _md5_FF(c, d, a, b, words[w + 10], 17, -42063);
				b = _md5_FF(b, c, d, a, words[w + 11], 22, -1990404162);
				a = _md5_FF(a, b, c, d, words[w + 12],  7,  1804603682);
				d = _md5_FF(d, a, b, c, words[w + 13], 12, -40341101);
				c = _md5_FF(c, d, a, b, words[w + 14], 17, -1502002290);
				b = _md5_FF(b, c, d, a, words[w + 15], 22,  1236535329);

				a = _md5_GG(a, b, c, d, words[w +  1],  5, -165796510);
				d = _md5_GG(d, a, b, c, words[w +  6],  9, -1069501632);
				c = _md5_GG(c, d, a, b, words[w + 11], 14,  643717713);
				b = _md5_GG(b, c, d, a, words[w +  0], 20, -373897302);
				a = _md5_GG(a, b, c, d, words[w +  5],  5, -701558691);
				d = _md5_GG(d, a, b, c, words[w + 10],  9,  38016083);
				c = _md5_GG(c, d, a, b, words[w + 15], 14, -660478335);
				b = _md5_GG(b, c, d, a, words[w +  4], 20, -405537848);
				a = _md5_GG(a, b, c, d, words[w +  9],  5,  568446438);
				d = _md5_GG(d, a, b, c, words[w + 14],  9, -1019803690);
				c = _md5_GG(c, d, a, b, words[w +  3], 14, -187363961);
				b = _md5_GG(b, c, d, a, words[w +  8], 20,  1163531501);
				a = _md5_GG(a, b, c, d, words[w + 13],  5, -1444681467);
				d = _md5_GG(d, a, b, c, words[w +  2],  9, -51403784);
				c = _md5_GG(c, d, a, b, words[w +  7], 14,  1735328473);
				b = _md5_GG(b, c, d, a, words[w + 12], 20, -1926607734);

				a = _md5_HH(a, b, c, d, words[w +  5],  4, -378558);
				d = _md5_HH(d, a, b, c, words[w +  8], 11, -2022574463);
				c = _md5_HH(c, d, a, b, words[w + 11], 16,  1839030562);
				b = _md5_HH(b, c, d, a, words[w + 14], 23, -35309556);
				a = _md5_HH(a, b, c, d, words[w +  1],  4, -1530992060);
				d = _md5_HH(d, a, b, c, words[w +  4], 11,  1272893353);
				c = _md5_HH(c, d, a, b, words[w +  7], 16, -155497632);
				b = _md5_HH(b, c, d, a, words[w + 10], 23, -1094730640);
				a = _md5_HH(a, b, c, d, words[w + 13],  4,  681279174);
				d = _md5_HH(d, a, b, c, words[w +  0], 11, -358537222);
				c = _md5_HH(c, d, a, b, words[w +  3], 16, -722521979);
				b = _md5_HH(b, c, d, a, words[w +  6], 23,  76029189);
				a = _md5_HH(a, b, c, d, words[w +  9],  4, -640364487);
				d = _md5_HH(d, a, b, c, words[w + 12], 11, -421815835);
				c = _md5_HH(c, d, a, b, words[w + 15], 16,  530742520);
				b = _md5_HH(b, c, d, a, words[w +  2], 23, -995338651);

				a = _md5_II(a, b, c, d, words[w +  0],  6, -198630844);
				d = _md5_II(d, a, b, c, words[w +  7], 10,  1126891415);
				c = _md5_II(c, d, a, b, words[w + 14], 15, -1416354905);
				b = _md5_II(b, c, d, a, words[w +  5], 21, -57434055);
				a = _md5_II(a, b, c, d, words[w + 12],  6,  1700485571);
				d = _md5_II(d, a, b, c, words[w +  3], 10, -1894986606);
				c = _md5_II(c, d, a, b, words[w + 10], 15, -1051523);
				b = _md5_II(b, c, d, a, words[w +  1], 21, -2054922799);
				a = _md5_II(a, b, c, d, words[w +  8],  6,  1873313359);
				d = _md5_II(d, a, b, c, words[w + 15], 10, -30611744);
				c = _md5_II(c, d, a, b, words[w +  6], 15, -1560198380);
				b = _md5_II(b, c, d, a, words[w + 13], 21,  1309151649);
				a = _md5_II(a, b, c, d, words[w +  4],  6, -145523070);
				d = _md5_II(d, a, b, c, words[w + 11], 10, -1120210379);
				c = _md5_II(c, d, a, b, words[w +  2], 15,  718787259);
				b = _md5_II(b, c, d, a, words[w +  9], 21, -343485551);


				a = (a + aa) >>> 0;
				b = (b + bb) >>> 0;
				c = (c + cc) >>> 0;
				d = (d + dd) >>> 0;

			}


			this.__a = ((a << 8) | (a >>> 24)) & 0x00ff00ff | ((a << 24) | (a >>> 8)) & 0xff00ff00;
			this.__b = ((b << 8) | (b >>> 24)) & 0x00ff00ff | ((b << 24) | (b >>> 8)) & 0xff00ff00;
			this.__c = ((c << 8) | (c >>> 24)) & 0x00ff00ff | ((c << 24) | (c >>> 8)) & 0xff00ff00;
			this.__d = ((d << 8) | (d >>> 24)) & 0x00ff00ff | ((d << 24) | (d >>> 8)) & 0xff00ff00;

		},

		digest: function() {

			let bytes = _words_to_bytes([
				this.__a,
				this.__b,
				this.__c,
				this.__d
			]);


			let hash = '';
			for (let b = 0; b < bytes.length; b++) {

				hash += (bytes[b] >>> 4).toString(16);
				hash += (bytes[b] &  15).toString(16);

			}


			return new Buffer(hash, 'hex');

		}

	};


	return Composite;

});

