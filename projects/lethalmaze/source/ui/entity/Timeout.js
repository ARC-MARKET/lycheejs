
lychee.define('game.ui.entity.Timeout').requires([
	'lychee.effect.Alpha',
	'lychee.effect.Visible'
]).includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global, attachments) {

	var _Alpha   = lychee.import('lychee.effect.Alpha');
	var _Visible = lychee.import('lychee.effect.Visible');
	var _Entity  = lychee.import('lychee.ui.Entity');
	var _FONT    = attachments["fnt"];
	var _SOUND   = attachments["snd"];



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.timeout = 30000;


		this.__pulse = {
			active:   false,
			duration: 500,
			start:    null,
			alpha:    0.0
		};


		this.setTimeout(settings.timeout);

		delete settings.timeout;


		settings.width  = typeof settings.width === 'number'  ? settings.width  : 512;
		settings.height = typeof settings.height === 'number' ? settings.height : 512;
		settings.shape  = _Entity.SHAPE.rectangle;


		_Entity.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {
			return false;
		}, this);

		this.bind('key', function(key, name, delta) {
			return false;
		}, this);

		this.bind('focus', function() {
			this.setState('default');
		}, this);

		this.bind('blur', function() {
			this.setState('default');
		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.entity.Timeout';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var alpha    = this.alpha;
			var position = this.position;
			var x        = position.x + offsetX;
			var y        = position.y + offsetY;
			var hwidth   = this.width  / 2;
			var hheight  = this.height / 2;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


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

				renderer.setAlpha(alpha);

			}


			var label = '' + ((this.timeout / 1000) | 0);
			if (label === '0') {
				label = 'Fight!';
			}

			renderer.drawText(
				x,
				y,
				label,
				_FONT,
				true
			);


			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}

		},

		update: function(clock, delta) {

			var pulse = this.__pulse;
			if (pulse.active === true) {

				if (pulse.start === null) {
					pulse.start = clock;
				}

				var t = (clock - pulse.start) / pulse.duration;
				if (t <= 1) {
					pulse.alpha = (1 - t);
				} else {
					pulse.alpha  = 0.0;
					pulse.active = false;
				}

			}


			_Entity.prototype.update.call(this, clock, delta);

		},



		/*
		 * CUSTOM API
		 */

		setTimeout: function(timeout) {

			timeout = typeof timeout === 'number' ? (timeout | 0) : null;


			if (timeout !== null) {

				var pulse = this.__pulse;


				pulse.alpha  = 1.0;
				pulse.start  = null;
				pulse.active = true;

				_SOUND.play();


				this.timeout = timeout;


				return true;

			}


			return false;

		},

		setVisible: function(visible) {

			if (visible === true) {

				this.addEffect(new _Alpha({
					type:     _Alpha.TYPE.easeout,
					alpha:    1.0,
					duration: 500
				}));

				this.addEffect(new _Visible({
					delay:   500,
					visible: true
				}));


				return true;

			} else if (visible === false) {

				this.addEffect(new _Alpha({
					type:     _Alpha.TYPE.easeout,
					alpha:    0.0,
					duration: 500
				}));

				this.addEffect(new _Visible({
					delay:   500,
					visible: false
				}));


				return true;

			}


			return false;

		}

	};


	return Class;

});

