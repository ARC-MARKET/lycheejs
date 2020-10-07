
lychee.define('lychee.crypto.MURMUR').exports((lychee, global, attachments) => {

	const _C1  = 0xcc9e2d51;
	const _C1B = 0x85ebca6b;
	const _C2  = 0x1b873593;
	const _C2B = 0xc2b2ae35;



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function() {

		this.__hash = 0;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'lychee.crypto.MURMUR',
				'arguments':   []
			};

		},



		/*
		 * CRYPTO API
		 */

		update: function(data) {

			data = data instanceof Buffer ? data : Buffer.from(data, 'utf8');


			let remain = data.length % 4;
			let bytes  = data.length - remain;

			let b   = 0;
			let h1  = this.__hash;
			let h1b = 0;
			let k1  = 0;


			while (b < bytes) {

				k1 = ((data[b] & 0xff)) | ((data[b + 1] & 0xff) << 8) | ((data[b + 2] & 0xff) << 16) | ((data[b + 3] & 0xff) << 24);
				k1 = ((((k1 & 0xffff) * _C1) + ((((k1 >>> 16) * _C1) & 0xffff) << 16))) & 0xffffffff;
				k1 = (k1 << 15) | (k1 >>> 17);
				k1 = ((((k1 & 0xffff) * _C2) + ((((k1 >>> 16) * _C2) & 0xffff) << 16))) & 0xffffffff;

				h1 ^= k1;
				h1  = (h1 << 13) | (h1 >>> 19);
				h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
				h1  = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));

				b += 4;

			}


			k1 = 0;


			if (remain === 3) {

				k1 ^= (data[b + 2] & 0xff) << 16;

			} else if (remain === 2) {

				k1 ^= (data[b + 1] & 0xff) << 8;

			} else if (remain === 1) {

				k1 ^= (data[b] & 0xff);

				k1 = (((k1 & 0xffff) * _C1) + ((((k1 >>> 16) * _C1) & 0xffff) << 16)) & 0xffffffff;
				k1 = (k1 << 15) | (k1 >>> 17);
				k1 = (((k1 & 0xffff) * _C2) + ((((k1 >>> 16) * _C2) & 0xffff) << 16)) & 0xffffffff;
				h1 ^= k1;

			}


			h1 ^= data.length;

			h1 ^= h1 >>> 16;
			h1  = (((h1 & 0xffff) * _C1B) + ((((h1 >>> 16) * _C1B) & 0xffff) << 16)) & 0xffffffff;
			h1 ^= h1 >>> 13;
			h1  = (((h1 & 0xffff) * _C2B) + ((((h1 >>> 16) * _C2B) & 0xffff) << 16)) & 0xffffffff;
			h1 ^= h1 >>> 16;


			this.__hash = h1 >>> 0;

		},

		digest: function() {

			let hash = (this.__hash).toString(16);
			if (hash.length % 2 === 1) {
				hash = '0' + hash;
			}

			return Buffer.from(hash, 'hex');

		}

	};


	return Composite;

});

