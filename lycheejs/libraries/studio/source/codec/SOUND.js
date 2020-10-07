
lychee.define('studio.codec.SOUND').exports((lychee, global, attachments) => {

	let _SOUND_ID = 0;



	/*
	 * HELPERS
	 */

	const _encode = function(sound, settings) {

		let mp3 = settings.mp3 || null;
		if (mp3 !== null) {

			let data = mp3.serialize();
			let blob = data.blob || null;
			if (blob instanceof Object && blob.buffer instanceof Object) {

				if (blob.buffer.mp3 !== null) {

					sound.deserialize({
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

				sound.deserialize({
					buffer: {
						ogg: blob.buffer.ogg
					}
				});

			}

		}

	};

	const _decode = function(sound, settings) {

		let buffer = sound.__buffer;


		if (buffer.mp3 !== null) {

			let id    = _SOUND_ID++;
			let tmp   = buffer.mp3.serialize();
			let sound = new lychee.Asset('/tmp/Sound-' + id + '.snd');

			sound.deserialize({
				buffer: {
					mp3: tmp
				}
			});

			settings.mp3 = sound;

		}

		if (buffer.ogg !== null) {

			let id    = _SOUND_ID++;
			let tmp   = buffer.ogg.serialize();
			let sound = new lychee.Asset('/tmp/Sound-' + id + '.snd');

			sound.deserialize({
				buffer: {
					ogg: tmp
				}
			});

			settings.ogg = sound;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'studio.codec.SOUND',
				'blob':      null
			};

		},

		encode: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				let id    = _SOUND_ID++;
				let sound = new Sound('/tmp/Sound-' + id + '.snd');

				_encode(sound, Object.assign({}, data));

				return sound;

			}


			return null;

		},

		decode: function(sound) {

			sound = sound instanceof Sound ? sound : null;


			if (sound !== null) {

				let object = {};

				_decode(sound, object);

				return object;

			}


			return null;

		}

	};


	return Module;

});

