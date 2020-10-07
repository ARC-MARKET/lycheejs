
lychee.define('studio.codec.MUSIC').exports((lychee, global, attachments) => {

	let _MUSIC_ID = 0;



	/*
	 * HELPERS
	 */

	const _encode = function(music, settings) {

		let mp3 = settings.mp3 || null;
		if (mp3 !== null) {

			let data = mp3.serialize();
			let blob = data.blob || null;
			if (blob instanceof Object && blob.buffer instanceof Object) {

				if (blob.buffer.mp3 !== null) {

					music.deserialize({
						buffer: {
							mp3: blob.buffer.mp3
						}
					});

				}

			}

		}


		let ogg = settings.ogg || null;
		if (ogg !== null) {

			let data = ogg.serialize();
			let blob = data.blob || null;
			if (blob instanceof Object && blob.buffer instanceof Object) {

				music.deserialize({
					buffer: {
						ogg: blob.buffer.ogg
					}
				});

			}

		}

	};

	const _decode = function(music, settings) {

		let buffer = music.__buffer;


		if (buffer.mp3 !== null) {

			let id    = _MUSIC_ID++;
			let tmp   = buffer.mp3.serialize();
			let music = new lychee.Asset('/tmp/Music-' + id + '.msc');

			music.deserialize({
				buffer: {
					mp3: tmp
				}
			});

			settings.mp3 = music;

		}

		if (buffer.ogg !== null) {

			let id    = _MUSIC_ID++;
			let tmp   = buffer.ogg.serialize();
			let music = new lychee.Asset('/tmp/Music-' + id + '.msc');

			music.deserialize({
				buffer: {
					ogg: tmp
				}
			});

			settings.ogg = music;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'studio.codec.MUSIC',
				'blob':      null
			};

		},

		encode: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				let id    = _MUSIC_ID++;
				let music = new Music('/tmp/Music-' + id + '.msc');

				_encode(music, Object.assign({}, data));

				return music;

			}


			return null;

		},

		decode: function(music) {

			music = music instanceof Music ? music : null;


			if (music !== null) {

				let object = {};

				_decode(music, object);

				return object;

			}


			return null;

		}

	};


	return Module;

});

