
ly.spritemap = function(image, structure, tile) {

	if (
		image instanceof HTMLImageElement === false
		|| image.width === 0
		|| image.height === 0
	) {
		throw 'Corrupt image and/or image data given';
	}

	if (Object.prototype.toString.call(structure) !== '[object Object]') {
		throw 'No structure given, which is required for mapping and slicing';
	}

	// TODO: This should be parsed somehow better
	this.__structure = JSON.parse(JSON.stringify(structure));

	this.__tile = (typeof tile === 'number' && tile > 0) ? tile : null;


	this.__source = {
		image: image,
		width: image.width,
		height: image.height
	};

	this.__spritemap = {};

	this.__init();

};


ly.spritemap.prototype = {

	/*
	 * PRIVATE API
	 */
	__init: function() {

		var tile = this.__tile;

		if (tile !== null) {

			var canvas = document.createElement('canvas'),
				slicer = document.createElement('canvas');


			// 1. Draw unsliced source image
			canvas.width = this.__source.width;
			canvas.height = this.__source.height;
			canvas.getContext('2d').drawImage(this.__source.image, 0, 0);


			for (var nsId in this.__structure) {

				var namespace = this.__structure[nsId];
				for (var id in namespace) {

					var states = namespace[id];
					for (var sId in states) {

						var state = states[sId];

						state.x = typeof state.x === 'number' ? state.x : 0;
						state.y = typeof state.y === 'number' ? state.y : 0;


						// 2. Draw unanimated spritemap entries
						if (state.animated !== true) {

							state.animated = false;

							slicer.width = tile;
							slicer.height = tile;

							slicer.getContext('2d').drawImage(
								this.__source.image,
								tile * state.x,
								tile * state.y,
								tile,
								tile,
								0,
								0,
								tile,
								tile
							);

							this.__setData(nsId, id, sId, slicer.toDataURL());

						// 2. Draw animated spritemap entry frame-per-frame
						} else if (state.animate === true) {

							var w, h, mode;

							if (state.x === 0) {

								mode = 'horizontal';

								w = this.__source.width;
								h = tile;
								state.frames = state.frames || w / tile;

							} else if (state.y === 0) {

								mode = 'vertical';

								w = tile;
								h = this.__source.height;
								state.frames = state.frames || h / tile;

							}


							slicer.width = tile;
							slicer.height = tile;


							// 2a. Draw each single frame
							for (var f = 0; f < state.frames; f++) {

								slicer.getContext('2d').clearRect(0, 0, tile, tile);

								slicer.getContext('2d').drawImage(
									this.__source.image,
									tile * state.x + (mode === 'horizontal' ? f * tile : 0),
									tile * state.y + (mode === 'vertical' ? f * tile : 0),
									tile,
									tile,
									0,
									0,
									tile,
									tile
								);

								this.__setData(nsId, id, sId, slicer.toDataURL(), f);

							}

						}

					}

				}

			}


		} else if (tile === null) {

			throw 'Pixel-based spritemap not supported yet';

		}

	},

	__setData: function(namespace, id, state, data, frame) {

		state = state !== undefined ? state : 'default';
		frame = typeof frame === 'number' ? frame : null;


		var img = new Image();
		img.src = data;


		if (this.__spritemap[namespace] === undefined) {
			this.__spritemap[namespace] = {};
		}
		if (this.__spritemap[namespace][id] === undefined) {
			this.__spritemap[namespace][id] = {};
		}
		if (this.__spritemap[namespace][id][state] === undefined) {
			this.__spritemap[namespace][id][state] = {};
		}


		if (frame === null) {

			this.__spritemap[namespace][id][state].image = img;

		} else {

			// Animated sprite entry will return a frame-based access object
			if (Object.prototype.toString.call(this.__spritemap[namespace][id][state].image !== '[object Object]')) {
				this.__spritemap[namespace][id][state].image = {};
			}

			this.__spritemap[namespace][id][state].image[frame] = img;

		}

	},



	/*
	 * PUBLIC API
	 */
	get: function(namespace, id, state) {

		state = typeof state === 'string' ? state : 'default';

		if (
			this.__spritemap[namespace] !== undefined
			&& this.__spritemap[namespace][id] !== undefined
		) {

			if (this.__spritemap[namespace][id][state] !== undefined) {
				return this.__spritemap[namespace][id][state];
			} else if (this.__spritemap[namespace][id]['default'] !== undefined) {
				return this.__spritemap[namespace][id]['default'];
			}

		}


		return null;

	}

};

