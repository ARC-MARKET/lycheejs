
lychee.define('lychee.ui.entity.Helper').tags({
	platform: 'nidium'
}).includes([
	'lychee.ui.entity.Button'
]).supports((lychee, global) => {

	if (typeof global.window === 'object') {

		if (typeof global.window.exec === 'function') {
			return true;
		}

	}


	return false;

}).exports((lychee, global, attachments) => {

	let   _exec    = function(cmd) {};
	const _Button  = lychee.import('lychee.ui.entity.Button');
	const _CONFIG  = attachments['json'].buffer;
	const _TEXTURE = attachments['png'];
	const _ROOT    = lychee.ROOT.lychee;



	/*
	 * FEATURE DETECTION
	 */

	(function(global) {

		if (typeof global.window === 'object') {

			if (typeof global.window.exec === 'function') {
				_exec = global.window.exec;
			}

		}

	})(global);



	/*
	 * HELPERS
	 */

	const _is_value = function(value) {

		value = typeof value === 'string' ? value : null;


		if (value !== null) {

			let action   = value.split('=')[0] || '';
			let resource = value.split('=')[1] || '';
			let data     = value.split('=')[2] || '';


			if (action === 'boot' && resource !== '') {

				return true;

			} else if (action === 'profile' && resource !== '' && data !== '') {

				return true;

			} else if (action === 'unboot') {

				return true;

			} else if (/^(start|stop|edit|file|web)$/g.test(action) && resource !== '') {

				return true;

			} else if (action === 'refresh') {

				return true;

			}

		}


		return false;

	};

	const _on_change = function(value) {

		let action = value.split('=')[0];
		let result = false;


		if (action === 'refresh') {

			// TODO: How to refresh the local program?
			// Restart with same arguments might fail due to serialization.

		} else {

			try {

				_exec('/bin/bash ' + _ROOT + '/bin/helper/helper.sh lycheejs://' + value);

				result = true;

			} catch (err) {

				result = false;

			}

		}


		return result;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({
			label: 'HELPER'
		}, data);


		this.__action = null;


		_Button.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('change', _on_change, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Button.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.entity.Helper';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let action   = this.__action;
			let alpha    = this.alpha;
			let font     = this.font;
			let label    = this.label;
			let position = this.position;
			let x        = position.x + offsetX;
			let y        = position.y + offsetY;
			let hwidth   = this.width  / 2;
			let hheight  = this.height / 2;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			renderer.drawBox(
				x - hwidth,
				y - hheight,
				x + hwidth,
				y + hheight,
				'#545454',
				true
			);


			let pulse = this.__pulse;
			if (pulse.active === true) {

				renderer.setAlpha(pulse.alpha);

				renderer.drawBox(
					x - hwidth,
					y - hheight,
					x + hwidth,
					y + hheight,
					'#32afe5',
					true
				);

				renderer.setAlpha(1.0);

			}


			if (action !== null) {

				let map = _CONFIG.map[action] || null;
				if (map !== null) {

					if (this.width > 96) {

						renderer.drawSprite(
							x - hwidth,
							y - hheight,
							_TEXTURE,
							map[0]
						);

						renderer.drawText(
							x,
							y,
							label,
							font,
							true
						);

					} else {

						renderer.drawSprite(
							x - map[0].w / 2,
							y - hheight,
							_TEXTURE,
							map[0]
						);

					}

				} else if (label !== null && font !== null) {

					renderer.drawText(
						x,
						y,
						label,
						font,
						true
					);

				}

			} else if (label !== null && font !== null) {

				renderer.drawText(
					x,
					y,
					label,
					font,
					true
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


			if (value !== null && _is_value(value) === true) {

				this.value    = value;
				this.__action = value.split('=')[0] || null;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

