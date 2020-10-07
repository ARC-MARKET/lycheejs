
lychee.define('studio.codec.SCENE').requires([
	'lychee.app.Entity',
	'lychee.app.Layer'
]).exports((lychee, global, attachments) => {

	let   _CONFIG_ID = 0;
	const _Entity    = lychee.import('lychee.app.Entity');
	const _Layer     = lychee.import('lychee.app.Layer');



	/*
	 * HELPERS
	 */

	const _deserialize_layer = function(layers, data, query) {

		let construct = data.constructor;
		let args      = data.arguments || [];
		let blob      = data.blob      || {};


		if (blob instanceof Object) {

			let entities = blob.entities || null;
			if (entities instanceof Array) {

				let map = blob.map || null;
				if (map instanceof Object) {

					for (let e = 0, el = entities.length; e < el; e++) {

						let id = null;

						for (let mid in map) {

							if (map[mid] === e) {
								id = mid;
							}

						}

						if (id !== null) {
							_deserialize_layer(layers, entities[e], query + ' > ' + id);
						} else {
							_deserialize_layer(layers, entities[e], query + ' > ' + e);
						}

					}

				} else {

					for (let e = 0, el = entities.length; e < el; e++) {
						_deserialize_layer(layers, entities[e], query + ' > ' + e);
					}

				}

			}

		}


		layers[query] = {
			constructor: construct,
			arguments:   args,
			blob:        blob,
			is_entity:   lychee.blobof(_Entity, data),
			is_layer:    lychee.blobof(_Layer,  data)
		};

	};

	const _encode = function(config, layers) {

		let buffer = config.buffer || null;
		if (buffer === null) {
			buffer = config.buffer = {
				layers: {}
			};
		}


		if (layers instanceof Object) {

			for (let query in layers) {
				// TODO: _serialize_layer(buffer.layers, layers[query]);
			}

		}

	};

	const _decode = function(config, layers) {

		let buffer = config.buffer || null;
		if (buffer instanceof Object) {

			let data = buffer.layers || null;
			if (data instanceof Object) {

				for (let id in data) {
					_deserialize_layer(layers, data[id], id);
				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'studio.codec.SCENE',
				'blob':      null
			};

		},

		encode: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				let id     = _CONFIG_ID++;
				let config = new Config('/tmp/Config-' + id + '.json');

				_encode(config, lychee.assignunlink({}, data));

				return config;

			}


			return null;

		},

		decode: function(config) {

			config = config instanceof Config ? config : null;


			if (config !== null) {

				let object = {};

				_decode(config, object);

				return object;

			}


			return null;


		}

	};


	return Module;

});

