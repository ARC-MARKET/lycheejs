
lychee.define('studio.codec.SPRITE').tags({
	platform: 'html'
}).supports((lychee, global) => {

	/*
	 * XXX: typeof CanvasRenderingContext2D is:
	 * > function in Chrome, Firefox, IE10
	 * > object in Safari, Safari Mobile
	 */

	if (
		typeof global.document !== 'undefined'
		&& typeof global.document.createElement === 'function'
		&& typeof global.CanvasRenderingContext2D !== 'undefined'
	) {
		return true;
	}


	return false;

}).exports((lychee, global, attachments) => {

	const _BORDER  = [ 64, 128, 256, 512, 1024, 2048, 4096, 8192 ];
	const _JSON    = {
		encode: function(data) {
			return JSON.stringify(data, null, '\t');
		},
		decode: JSON.parse
	};
	const _SHAPE   = {
		circle:    0,
		rectangle: 1,
		sphere:    2,
		cuboid:    3
	};
	let _CANVAS    = null;
	let _CONTEXT   = null;
	let _SPRITE_ID = 0;


	(function() {

		let doc = global.document || null;
		if (doc !== null) {

			let canvas = doc.createElement('canvas');
			if (canvas !== null) {

				let context = canvas.getContext('2d');
				if (context !== null) {
					_CANVAS  = canvas;
					_CONTEXT = context;
				}

			}

		}

	})();



	/*
	 * HELPERS
	 */

	const _measure_atlas = function(textures) {

		let atlas_border = _BORDER[0];
		let atlas_frames = 1;
		let frame_width  = 0;
		let frame_height = 0;

		textures.forEach(texture => {
			frame_width  = Math.max(frame_width,  texture.width);
			frame_height = Math.max(frame_height, texture.height);
		});


		let tmp_w = Math.round(Math.sqrt(frame_width));
		if (tmp_w % 2 !== 0) {
			frame_width = Math.pow(tmp_w + 1, 2);
		}

		let tmp_h = Math.round(Math.sqrt(frame_height));
		if (tmp_h % 2 !== 0) {
			frame_height = Math.pow(tmp_h + 1, 2);
		}


		if (textures.length > 1) {

			while (textures.length > Math.pow(atlas_frames, 2)) {

				atlas_border = _BORDER[_BORDER.indexOf(atlas_border) + 1] || null;

				if (atlas_border !== null) {

					atlas_frames = Math.floor(atlas_border / frame_width);

					if (atlas_frames === 0) {
						atlas_frames = 1;
					}

				} else {

					atlas_border = 8192;

					break;

				}

			}

		} else {

			let border = _BORDER.find(v => v > frame_width && v > frame_height) || null;
			if (border !== null) {
				atlas_border = border;
				atlas_frames = 1;
			}

		}


		return {
			border: atlas_border,
			frames: atlas_frames,
			frame:  {
				width:  frame_width,
				height: frame_height
			}
		};

	};

	const _render_frame = function(frame) {

		let map     = frame.render;
		let texture = frame.texture;


		_CONTEXT.drawImage(
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



	const _DEFAULTS = {
		width:    null,
		height:   null,
		depth:    null,
		radius:   null,
		shape:    1,
		textures: []
	};



	/*
	 * ENCODER and DECODER
	 */

	const _encode = function(texture, config, settings) {

		let atlas  = _measure_atlas(settings.textures);
		let frames = [];
		let states = {};
		let map    = {};



		/*
		 * 1. Measure frame dimensions
		 */

		settings.textures.forEach((texture, index) => {

			let state   = texture.url.split('/').pop().toLowerCase().split('_')[0].split('.')[0];
			let mapx    = (index % atlas.frames)       * atlas.frame.width;
			let mapy    = ((index / atlas.frames) | 0) * atlas.frame.height;
			let renderx = mapx + (atlas.frame.width  / 2) - (texture.width  / 2);
			let rendery = mapy + (atlas.frame.height / 2) - (texture.height / 2);
			let data    = {
				state:   state,
				texture: texture,
				map: {
					x:      mapx,
					y:      mapy,
					w:      atlas.frame.width,
					h:      atlas.frame.height,
					width:  atlas.frame.width,
					height: atlas.frame.height
				},
				render: {
					x: renderx,
					y: rendery,
					w: texture.width,
					h: texture.height
				}
			};

			frames.push(data);

		});



		/*
		 * 2. Generate Config States
		 */

		settings.textures.forEach(texture => {

			let state = texture.url.split('/').pop().toLowerCase().split('_')[0].split('.')[0];
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


		frames.forEach(frame => {

			let state = frame.state;
			if (map[state] === undefined) {
				map[state] = [];
			}

			map[state].push(frame.map);

		});



		/*
		 * 4. Render Config
		 */

		let tmp_config = {
			map:      map,
			shape:    settings.shape,
			states:   states,
			__sprite: {
				textures: []
			}
		};

		if (settings.shape === _SHAPE.circle || settings.shape === _SHAPE.sphere) {

			let radius = typeof settings.radius === 'number' ? (settings.radius | 0) : null;
			if (radius !== null) {
				tmp_config.radius = radius;
			}

		} else if (settings.shape === _SHAPE.rectangle) {

			let width  = typeof settings.width === 'number'  ? (settings.width  | 0) : null;
			let height = typeof settings.height === 'number' ? (settings.height | 0) : null;

			if (width !== null && height !== null) {
				tmp_config.width  = width;
				tmp_config.height = height;
			}


		} else if (settings.shape === _SHAPE.cuboid) {

			let width  = typeof settings.width === 'number'  ? (settings.width  | 0) : null;
			let height = typeof settings.height === 'number' ? (settings.height | 0) : null;
			let depth  = typeof settings.depth === 'number'  ? (settings.depth  | 0) : null;

			if (width !== null && height !== null && depth !== null) {
				tmp_config.width  = width;
				tmp_config.height = height;
				tmp_config.depth  = depth;
			}

		}

		settings.textures.forEach(texture => {

			let url = texture.url || null;
			if (url !== null) {
				tmp_config.__sprite.textures.push(url);
			}

		});



		/*
		 * 5. Render Texture
		 */

		_CANVAS.width  = atlas.border;
		_CANVAS.height = atlas.border;

		frames.forEach(frame => _render_frame(frame));



		/*
		 * Export Config and Texture
		 */

		let tmp1         = _JSON.encode(tmp_config);
		let tmp2         = Buffer.alloc(tmp1.length, tmp1, 'utf8');
		let config_blob  = 'data:application/json;base64,' + tmp2.toString('base64');
		let texture_blob = _CANVAS.toDataURL('image/png');


		config.deserialize({ buffer: config_blob });
		texture.deserialize({ buffer: texture_blob });

	};

	const _decode = function(texture, config, settings) {

		let buffer = config.buffer || {};
		let tmp    = buffer.__sprite;


		settings.shape = buffer.shape || _SHAPE.rectangle;


		let width  = buffer.width  || null;
		let height = buffer.height || null;
		let depth  = buffer.depth  || null;
		let radius = buffer.radius || null;

		if (width !== null)  settings.width  = width;
		if (height !== null) settings.height = height;
		if (depth !== null)  settings.depth  = depth;
		if (radius !== null) settings.radius = radius;


		settings.sprite = {
			textures: tmp.textures || []
		};

	};



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'studio.codec.SPRITE',
				'blob':      null
			};

		},

		encode: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				let id      = _SPRITE_ID++;
				let texture = new Texture('/tmp/Sprite-' + id + '.png');
				let config  = new Config('/tmp/Sprite-' + id + '.json');

				_encode(texture, config, Object.assign({}, _DEFAULTS, data));

				return {
					config:  config,
					texture: texture
				};

			}


			return null;

		},

		decode: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				let object = {};

				_decode(data.texture, data.config, object);

				return object;

			}


			return null;

		}

	};


	return Module;

});

