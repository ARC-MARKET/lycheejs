
lychee.define('tool.data.SPRITE').requires([
	'lychee.data.JSON'
]).tags({
	platform: 'html'
}).exports(function(lychee, tool, global, attachments) {

	var _JSON = lychee.data.JSON;



	/*
	 * HELPERS
	 */

	var _defaults = {};

	(function(defaults) {

		defaults.texture     = 512;
		defaults.frame       = 'power-of-two';
		defaults.boundingbox = 'auto';
		defaults.width       = null;
		defaults.height      = null;
		defaults.depth       = null;
		defaults.radius      = null;
		defaults.states      = 'auto';
		defaults.statemap    = 'image';
		defaults.files       = [];

	})(_defaults);


	var _Buffer = function(data, mode) {

		data = typeof data === 'string'          ? _JSON.decode(data) : null;
		mode = lychee.enumof(_Buffer.MODE, mode) ? mode               : 0;


		var settings = Object.assign({}, data);


		var config = settings.config;
		if (typeof config === 'string') {
			settings.config = new Config(config);
			settings.config.deserialize({ buffer: config });
		}

		var texture = settings.texture;
		if (typeof texture === 'string') {
			settings.texture = new Texture(texture);
			settings.texture.deserialize({ buffer: texture });
		}


		this.__data = {
			config:  null,
			texture: null
		};
		this.__mode = mode;


		this.setConfig(settings.config);
		this.setTexture(settings.texture);


		settings = null;

	};


	_Buffer.MODE = {
		read:  0,
		write: 1
	};

	_Buffer.prototype = {

		getBlob: function() {
			return this.__data;
		},

		toString: function() {

			var tmp = Object.assign({}, this.__data);

			if (tmp.config !== null) {
				tmp.config = tmp.config.url || null;
			}

			if (tmp.texture !== null) {
				tmp.texture = tmp.texture.url || null;
			}


			return _JSON.encode(tmp);

		},

		setConfig: function(config) {

			config = config instanceof Config ? config : null;


			if (config !== null) {

				this.__data.config = config;

				return true;

			}


			return false;

		},

		setTexture: function(texture) {

			texture = texture instanceof Texture ? texture : null;


			if (texture !== null) {

				this.__data.texture = texture;

				return true;

			}


			return false;

		}

	};



	/*
	 * ENCODER and DECODER
	 */

	var _encode_buffer = function(buffer, data) {

		var settings = Object.assign({}, _defaults, data);

		var frames = [];
		var states = {};
		var map    = {};



		/*
		 * 1. Measure frame dimensions
		 */

		(function(files) {

			var frame_width  = 0;
			var frame_height = 0;
			var size_x       = 0;
			var size_y       = 0;

			if (settings.frame === 'original') {

				files.forEach(function(file) {
					frame_width  = Math.max(frame_width,  file.data.width);
					frame_height = Math.max(frame_height, file.data.height);
				});

				size_x = Math.floor(settings.texture / frame_width);
				size_y = Math.floor(settings.texture / frame_height);

			} else if (settings.frame === 'power-of-two') {

				files.forEach(function(file) {
					frame_width  = Math.max(frame_width,  file.data.width);
					frame_height = Math.max(frame_height, file.data.height);
				});

				var tmp_w = Math.round(Math.sqrt(frame_width));
				if (tmp_w % 2 !== 0) {
					frame_width = Math.pow(tmp_w++, 2);
				}

				var tmp_h = Math.round(Math.sqrt(frame_height));
				if (tmp_h % 2 !== 0) {
					frame_height = Math.pow(tmp_h++, 2);
				}

				size_x = Math.floor(settings.texture / frame_width);
				size_y = Math.floor(settings.texture / frame_height);

			}


			if (size_x === 0) size_x = 1;
			if (size_y === 0) size_y = 1;


			files.forEach(function(file, index) {

				var state   = file.name.toLowerCase().split('_')[0].split('.')[0];
				var texture = file.data;


				var mapx    = ( index % size_x)      * frame_width;
				var mapy    = ((index / size_x) | 0) * frame_height;
				var renderx = mapx + (frame_width / 2) - (texture.width / 2);
				var rendery = mapy + (frame_height / 2) - (texture.height / 2);


				var data = {
					state:   state,
					texture: texture,
					map: {
						x: mapx,
						y: mapy,
						w: frame_width,
						h: frame_height
					},
					render: {
						x: renderx,
						y: rendery,
						w: texture.width,
						h: texture.height
					}
				};


				if (settings.boundingbox === 'auto') {
					data.map.width  = frame_width;
					data.map.height = frame_height;
				}


				frames.push(data);

			});

		})(settings.files);



		/*
		 * 2. Generate Config states
		 */

		(function(files) {

			if (settings.states === 'auto') {

				files.forEach(function(file) {

					var state = file.name.toLowerCase().split('_')[0].split('.')[0];
					if (states[state] === undefined) {

						states[state] = {
							animation: false
						};

					} else if (states[state].animation === false) {

						states[state].animation = true;
						states[state].duration  = 1000;
						states[state].loop      = true;

					}

				});

			} else if (settings.states === 'none') {

				if (files.length > 1) {

					states['default'] = {
						animation: true,
						duration:  1000,
						loop:      true
					};

				} else {

					states['default'] = {
						animation: false
					};

				}

			}

		})(settings.files);



		/*
		 * 3. Generate Config map
		 */

		(function(files) {

			if (settings.statemap === 'image') {

				frames.forEach(function(frame) {

					var state = frame.state;
					if (map[state] === undefined) {
						map[state] = [];
					}

					map[state].push(frame.map);

				});

			} else if (settings.statemap === 'none') {

				map['default'] = [];

				frames.forEach(function(frame) {
					map['default'].push(frame.map);
				});

			}

		})(settings.files);



		/*
		 * 4. Render Config
		 */

		var config = null;


		(function() {

			var width  = typeof settings.width === 'number'  ? (settings.width  | 0) : null;
			var height = typeof settings.height === 'number' ? (settings.height | 0) : null;
			var depth  = typeof settings.depth === 'number'  ? (settings.depth  | 0) : null;
			var radius = typeof settings.radius === 'number' ? (settings.radius | 0) : null;


			var data = {
				map:    map,
				states: states
			};



			/*
			 * 4.1. Integrate shapes and dimensions
			 */

			if (radius !== null) {

				data.radius = radius;
				data.shape  = 0;

			} else {

				if (width !== null && height !== null) {

					data.width  = width;
					data.height = height;

					if (depth !== null) {

						data.depth = depth;
						data.shape = 3;

					} else {

						data.shape = 1;

					}

				}

			}



			/*
			 * 4.2 Export Config
			 */

			// var blob = 'data:application/json;base64,' + new Buffer(_JSON.encode(data), 'utf8').toString('base64');
			var blob = 'data:application/json;base64,' + new Buffer(JSON.stringify(data, null, '\t'), 'utf8').toString('base64');

			config = new Config(blob);
			config.deserialize({ buffer: blob });

		})();



		/*
		 * 5. Render Texture
		 */

		var texture = null;


		(function() {

			var canvas = document.createElement('canvas');

			canvas.width  = settings.texture;
			canvas.height = settings.texture;


			var render_frame = function(frame) {

				var map     = frame.render;
				var texture = frame.texture;


				this.drawImage(
					texture.buffer,
					0,
					0,
					map.w,
					map.h,
					map.x,
					map.y,
					map.w,
					map.h
				);

			};


			/*
			 * 5.1 Render Frames
			 */

			frames.forEach(function(frame) {
				render_frame.call(canvas.getContext('2d'), frame);
			});



			/*
			 * 5.2 Export Texture
			 */

			var blob = canvas.toDataURL('image/png');

			texture    = new Texture(blob);
			texture.deserialize({ buffer: blob });

		})();



		/*
		 * 6. Save Buffer
		 */

		buffer.setConfig(config);
		buffer.setTexture(texture);

	};

	var _encode = function(buffer, data) {

		if (data instanceof Object) {

			buffer.setConfig(data.config);

			if (data.texture instanceof Texture) {
				buffer.setTexture(data.texture);
			} else {
				_encode_buffer(buffer, data);
			}

		}

	};


	var _decode = function(buffer) {

		var value = buffer.getBlob();
		if (value.texture === null) {
			value = undefined;
		}


		return value;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {};


	Module.encode = function(data) {

		var buffer = new _Buffer('', _Buffer.MODE.write);

		_encode(buffer, data);

		return buffer.toString();

	};


	Module.decode = function(data) {

		var buffer = new _Buffer(data, _Buffer.MODE.read);

		var value = _decode(buffer);
		if (value === undefined) {
			return null;
		} else {
			return value;
		}

	};


	return Module;

});

