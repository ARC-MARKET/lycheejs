
lychee.define('app.ui.entity.Bubble').includes([
	'lychee.ui.Entity'
]).exports((lychee, global, attachments) => {

	const _Entity  = lychee.import('lychee.ui.Entity');
	const _CONFIG  = attachments['json'].buffer;
	const _FONT    = attachments['fnt'];
	const _TEXTURE = attachments['png'];
	const _AVATAR  = {
		config:  attachments['avatar.json'].buffer,
		texture: attachments['avatar.png']
	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.key   = 'urine';
		this.value = '0%';


		this.setKey(states.key);
		this.setValue(states.value);


		delete states.key;
		delete states.value;


		states.alpha  = 1.0;
		states.radius = 48;
		states.shape  = _Entity.SHAPE.circle;


		_Entity.call(this, states);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'app.ui.entity.Bubble';


			let states = data['arguments'][0] || {};
			let blob   = (data['blob'] || {});


			if (this.key !== 'urine') states.key   = this.key;
			if (this.value !== '0%')  states.value = this.value;


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let alpha    = this.alpha;
			let position = this.position;
			let map      = null;
			let radius   = this.radius;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			renderer.drawCircle(
				position.x + offsetX,
				position.y + offsetY,
				radius - 1,
				'#00000',
				true
			);

			renderer.drawCircle(
				position.x + offsetX,
				position.y + offsetY,
				radius,
				'#0ba2ff',
				false,
				1
			);


			if (this.key === 'avatar') {

				map = _AVATAR.config.map[this.value] || null;

				if (map !== null) {

					renderer.drawSprite(
						position.x + offsetX - 24,
						position.y + offsetY - 24,
						_AVATAR.texture,
						map[0]
					);

				}

			} else {

				map = _CONFIG.map[this.key] || _CONFIG.map[this.value] || null;

				if (map !== null) {

					renderer.drawSprite(
						position.x + offsetX - 16,
						position.y + offsetY - 30,
						_TEXTURE,
						map[0]
					);

					renderer.drawText(
						position.x + offsetX,
						position.y + offsetY + 12,
						this.value,
						_FONT,
						true
					);

				} else {

					renderer.drawText(
						position.x + offsetX,
						position.y + offsetY + 2,
						this.value,
						_FONT,
						true
					);

				}

			}


			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}

		},



		/*
		 * CUSTOM API
		 */

		setKey: function(key) {

			key = typeof key === 'string' ? key : null;


			if (key !== null) {

				this.key = key;


				return true;

			}

		},

		setValue: function(value) {

			value = typeof value === 'string' ? value : null;


			if (value !== null) {

				this.value = value;


				return true;

			}


			return false;

		}

	};


	return Composite;

});

