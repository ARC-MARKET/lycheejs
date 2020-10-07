
lychee.define('lychee.ui.sprite.Background').includes([
	'lychee.ui.Sprite'
]).exports((lychee, global, attachments) => {

	const _Sprite = lychee.import('lychee.ui.Sprite');



	/*
	 * HELPERS
	 */

	const _render_buffer = function(renderer) {

		if (this.__buffer !== null) {
			this.__buffer.resize(this.width, this.height);
		} else {
			this.__buffer = renderer.createBuffer(this.width, this.height);
		}


		renderer.clear(this.__buffer);
		renderer.setBuffer(this.__buffer);
		renderer.setAlpha(1.0);


		let color = this.color;
		if (color !== null) {

			renderer.drawBox(
				0,
				0,
				this.width,
				this.height,
				color,
				true
			);

		}


		let texture = this.texture;
		let map     = this.__map[this.state][this.frame] || null;
		if (texture !== null && map !== null) {

			if (map.w !== 0 && map.h !== 0 && (map.w <= this.width || map.h <= this.height)) {

				let px = this.origin.x - map.w;
				let py = this.origin.y - map.h;


				while (px < this.width) {

					py = this.origin.y - map.h;

					while (py < this.height) {

						renderer.drawSprite(
							px,
							py,
							texture,
							map
						);

						py += map.h;

					}

					px += map.w;

				}

			} else {

				renderer.drawSprite(
					0,
					0,
					texture,
					map
				);

			}

		}


		renderer.setBuffer(null);
		this.__isDirty = false;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.color  = null;
		this.origin = { x: 0, y: 0 };

		this.__buffer  = null;
		this.__isDirty = true;


		this.setColor(states.color);


		delete states.color;


		states.width  = typeof states.width === 'number'  ? states.width  : 512;
		states.height = typeof states.height === 'number' ? states.height : 512;
		states.shape  = lychee.ui.Entity.SHAPE.rectangle;


		_Sprite.call(this, states);



		/*
		 * INITIALIZATION
		 */

		this.bind('reshape', function(orientation, rotation, width, height) {

			if (typeof width === 'number' && typeof height === 'number') {

				this.width     = width;
				this.height    = height;
				this.__isDirty = true;

			}

		}, this);


		this.setOrigin(states.origin);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.sprite.Background';

			let states = data['arguments'][0];
			let blob   = (data['blob'] || {});


			if (this.color !== null) states.color = this.color;


			if (this.origin.x !== 0 || this.origin.y !== 0) {

				states.origin = {};

				if (this.origin.x !== 0) states.origin.x = this.origin.x;
				if (this.origin.y !== 0) states.origin.y = this.origin.y;

			}


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let alpha    = this.alpha;
			let position = this.position;
			let x        = position.x + offsetX;
			let y        = position.y + offsetY;
			let hwidth   = this.width  / 2;
			let hheight  = this.height / 2;


			if (this.__isDirty === true) {
				_render_buffer.call(this, renderer);
			}


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}

			if (this.__buffer !== null) {

				renderer.drawBuffer(
					x - hwidth,
					y - hheight,
					this.__buffer
				);

			}

			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}

		},



		/*
		 * CUSTOM API
		 */

		setColor: function(color) {

			color = /(#[AaBbCcDdEeFf0-9]{6})/g.test(color) ? color : null;


			if (color !== null) {

				this.color     = color;
				this.__isDirty = true;


				return true;

			}


			return false;

		},

		setOrigin: function(origin) {

			origin = origin instanceof Object ? origin : null;


			if (origin !== null) {

				this.origin.x = typeof origin.x === 'number' ? origin.x : this.origin.x;
				this.origin.y = typeof origin.y === 'number' ? origin.y : this.origin.y;


				let map = this.__map[this.state][this.frame] || null;
				if (map !== null) {
					this.origin.x %= map.w;
					this.origin.y %= map.h;
				}

				this.__isDirty = true;


				return true;

			}


			return false;

		}

	};


	return Composite;

});

