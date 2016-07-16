
lychee.define('lychee.ui.entity.Helper').tags({
	platform: 'html-nwjs'
}).includes([
	'lychee.ui.entity.Button'
]).supports(function(lychee, global) {

	var child_process = require('child_process');
	if (typeof child_process.execFile === 'function') {

		if (typeof global.document !== 'undefined' && typeof global.document.createElement === 'function') {

			if (typeof global.location !== 'undefined' && typeof global.location.href === 'string') {
				return true;
			}

		}

	}

	return false;

}).exports(function(lychee, global, attachments) {

	var _texture       = attachments["png"];
	var _config        = attachments["json"].buffer;
	var _child_process = require('child_process');
	var _root          = lychee.ROOT.lychee;



	/*
	 * HELPERS
	 */

	var _is_value = function(value) {

		value = typeof value === 'string' ? value : null;


		if (value !== null) {

			var action   = value.split('=')[0] || '';
			var resource = value.split('=')[1] || '';
			var data     = value.split('=')[2] || '';


			if (action === 'boot' && resource !== '') {

				return true;

			} else if (action === 'profile' && resource !== '' && data !== '') {

				return true;

			} else if (action === 'unboot') {

				return true;

			} else if (action.match(/start|stop|edit|file|web/g) && resource !== '') {

				return true;

			} else if (action === 'refresh') {

				return true;

			}

		}


		return false;

	};

	var _help = function(value) {

		var action = value.split('=')[0];
		var helper = null;


		if (action === 'refresh') {

			helper      = global.document.createElement('a');
			helper.href = './' + global.location.href.split('/').pop();
			helper.click();

		} else {

			try {

				var helper = _child_process.execFile(_root + '/bin/helper.sh', [
					'lycheejs://' + value
				], {
					cwd: _root
				}, function(error, stdout, stderr) {

					stderr = (stderr.trim() || '').toString();

					if (error !== null && error.signal !== 'SIGTERM') {

						helper = null;

					} else if (stderr !== '') {

						if (lychee.debug === true) {

							stderr.trim().split('\n').forEach(function(line) {
								console.error('lychee.ui.entity.Helper: "' + line.trim() + '"');
							});

						}

					}

				});

				helper.stdout.on('data', function(lines) {});
				helper.stderr.on('data', function(lines) {});

				helper.on('error', function() {
					this.kill('SIGTERM');
				});

				helper.on('exit', function(code) {});

			} catch(err) {

				helper = null;

			}

		}


		return helper !== null;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({
			label: 'HELPER'
		}, data);


		this.__action = null;


		lychee.ui.entity.Button.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('change', function(value) {
			return _help(value);
		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.entity.Button.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.entity.Helper';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var action   = this.__action;
			var alpha    = this.alpha;
			var font     = this.font;
			var label    = this.label;
			var position = this.position;
			var x        = position.x + offsetX;
			var y        = position.y + offsetY;
			var hwidth   = this.width  / 2;
			var hheight  = this.height / 2;


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


			var pulse = this.__pulse;
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

				var map = _config.map[action] || null;
				if (map !== null) {

					if (this.width > 96) {

						renderer.drawSprite(
							x - hwidth,
							y - hheight,
							_texture,
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
							_texture,
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

			value = _is_value(value) === true ? value : null;


			if (value !== null) {

				this.value    = value;
				this.__action = value.split('=')[0] || null;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

