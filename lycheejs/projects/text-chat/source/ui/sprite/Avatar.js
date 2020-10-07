
lychee.define('app.ui.sprite.Avatar').includes([
	'lychee.ui.Sprite'
]).exports((lychee, global, attachments) => {

	const _Sprite  = lychee.import('lychee.ui.Sprite');
	const _TEXTURE = attachments['png'];
	const _CONFIG  = {
		width:  128,
		height: 128
	};



	/*
	 * HELPERS
	 */

	const _random_color = function() {

		let intr = parseInt((Math.random() * 255).toFixed(0), 10);
		let intg = parseInt((Math.random() * 255).toFixed(0), 10);
		let intb = parseInt((Math.random() * 255).toFixed(0), 10);

		let strr = intr > 15 ? (intr).toString(16) : '0' + (intr).toString(16);
		let strg = intg > 15 ? (intg).toString(16) : '0' + (intg).toString(16);
		let strb = intb > 15 ? (intb).toString(16) : '0' + (intb).toString(16);

		return '#' + strr + strg + strb;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.value = _random_color();


		this.setValue(states.value);

		delete states.value;


		states.texture = _TEXTURE;
		states.width   = _CONFIG.width;
		states.height  = _CONFIG.height;


		_Sprite.call(this, states);



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {

			this.value = _random_color();
			this.trigger('change', [ this.value ]);

		}, this);


		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'app.ui.sprite.Avatar';

			let states = data['arguments'][0] || {};
			let blob   = data['blob'] || {};


			if (this.value !== null) states.value = this.value;


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let alpha    = this.alpha;
			let position = this.position;
			let value    = this.value;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			let x  = position.x + offsetX;
			let y  = position.y + offsetY;
			let x1 = x - this.width  / 2;
			let y1 = y - this.height / 2;


			renderer.drawSprite(x1, y1, _TEXTURE);

			renderer.drawBox(x - 13, y - 13, x + 13, y - 2, value, true);
			renderer.drawBox(x - 10, y - 12, x + 10, y - 1, value, true);
			renderer.drawBox(x -  6, y - 12, x +  6, y - 0, value, true);

			renderer.drawCircle(x, y - 13, 12, value, true);
			renderer.drawCircle(x, y - 18, 10, value, true);


			if (alpha !== 1) {
				renderer.setAlpha(1);
			}

		},



		/*
		 * CUSTOM API
		 */

		setValue: function(value) {

			value = /(#[AaBbCcDdEeFf0-9]{6})/g.test(value) ? value : null;


			if (value !== null) {

				this.value = value;
				this.trigger('change', [ this.value ]);

				return true;

			}


			return false;

		}

	};


	return Composite;

});

