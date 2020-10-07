
lychee.define('ranger.ui.entity.Identifier').includes([
	'lychee.ui.entity.Label'
]).exports((lychee, global, attachments) => {

	const _Label = lychee.import('lychee.ui.entity.Label');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		_Label.call(this, states);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Label.prototype.serialize.call(this);
			data['constructor'] = 'ranger.ui.entity.Identifier';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let alpha    = this.alpha;
			let position = this.position;


			let x = position.x + offsetX;
			let y = position.y + offsetY;


			let font    = this.font;
			let value   = this.value;
			let hwidth  = this.width  / 2;
			let hheight = this.height / 2;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			if (font !== null) {

				renderer.drawText(
					x - hwidth,
					y - (hheight - font.lineheight / 2),
					value,
					font,
					false
				);

			}


			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}

		},



		/*
		 * CUSTOM API
		 */

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

