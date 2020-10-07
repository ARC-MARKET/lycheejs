
lychee.define('studio.ui.element.preview.Sprite').requires([
	'lychee.app.Entity',
	'lychee.app.Sprite'
]).includes([
	'lychee.ui.Element'
]).exports((lychee, global, attachments) => {

	const _Element = lychee.import('lychee.ui.Element');
	const _Entity  = lychee.import('lychee.app.Entity');
	const _Sprite  = lychee.import('lychee.app.Sprite');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.value = null;

		this.__sprites = [];


		states.label   = 'Preview';
		states.options = [];


		_Element.call(this, states);


		this.setValue(states.value);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'studio.ui.element.preview.Sprite';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let alpha    = this.alpha;
			let position = this.position;
			let x        = position.x + offsetX;
			let y        = position.y + offsetY;
			let hwidth   = (this.width  - 2) / 2;
			let hheight  = (this.height - 2) / 2;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			_Element.prototype.render.call(this, renderer, offsetX, offsetY);


			let sprites  = this.__sprites;
			let offset_x = -1 * hwidth  + 16;
			let offset_y = -1 * hheight + 96;
			let bb_y     = 0;

			for (let s = 0, sl = sprites.length; s < sl; s++) {

				let sprite = sprites[s];
				let shape  = sprite.shape;

				let bb_x = 0;

				if (shape === _Sprite.SHAPE.rectangle || shape === _Sprite.SHAPE.cuboid) {

					bb_x = sprite.width;
					bb_y = Math.max(bb_y, sprite.height);

				} else {

					bb_x = sprite.radius * 2;
					bb_y = Math.max(bb_y, sprite.radius * 2);

				}


				sprite.render(
					renderer,
					x + offset_x + bb_x / 2,
					y + offset_y + bb_y / 2
				);


				offset_x += bb_x + 16;

				if (offset_x >= hwidth - 16) {
					offset_x = -1 * hwidth + 16;
					offset_y += bb_y;
				}

				if (offset_y >= hheight - 64) {
					break;
				}

			}

			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}

		},

		update: function(clock, delta) {

			_Element.prototype.update.call(this, clock, delta);


			let sprites = this.__sprites;
			for (let s = 0, sl = sprites.length; s < sl; s++) {
				sprites[s].update(clock, delta);
			}

		},



		/*
		 * CUSTOM API
		 */

		setValue: function(value) {

			value = value instanceof Object ? value : null;


			if (value !== null) {

				this.value = value;
				this.setOptions([ 'Save' ]);


				let buffer    = value.config.buffer;
				let s_shape   = typeof buffer.shape === 'number'  ? buffer.shape  : null;
				let s_width   = typeof buffer.width === 'number'  ? buffer.width  : null;
				let s_height  = typeof buffer.height === 'number' ? buffer.height : null;
				let s_depth   = typeof buffer.depth === 'number'  ? buffer.depth  : null;
				let s_radius  = typeof buffer.radius === 'number' ? buffer.radius : null;
				let s_texture = value.texture instanceof Texture  ? value.texture : null;
				let s_states  = buffer.states instanceof Object   ? buffer.states : null;
				let s_map     = buffer.map instanceof Object      ? buffer.map    : null;


				if (s_states !== null) {

					this.__sprites = Object.keys(s_states).map(state => {

						let sprite = new _Sprite();

						if (s_texture !== null) {
							sprite.setTexture(s_texture);
						}

						if (s_states !== null && s_map !== null) {
							sprite.setStates(s_states);
							sprite.setMap(s_map);
							sprite.setState(state);
						}

						if (s_shape !== null) {

							if (lychee.enumof(_Entity.SHAPE, s_shape) === true) {
								sprite.setShape(s_shape);
							}

						}

						if (s_width !== null) {
							sprite.width = s_width;
						}

						if (s_height !== null) {
							sprite.height = s_height;
						}

						if (s_depth !== null) {
							sprite.depth = s_depth;
						}

						if (s_radius !== null) {
							sprite.radius = s_radius;
						}


						return sprite;

					});

				}




				return true;

			}


			return false;

		}

	};


	return Composite;

});

