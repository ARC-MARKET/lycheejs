
lychee.define('game.ui.entity.Timeout').requires([
	'lychee.effect.Alpha',
	'lychee.effect.Visible'
]).includes([
	'lychee.ui.Entity'
]).exports((lychee, global, attachments) => {

	const _Alpha   = lychee.import('lychee.effect.Alpha');
	const _Visible = lychee.import('lychee.effect.Visible');
	const _Entity  = lychee.import('lychee.ui.Entity');
	const _FONT    = attachments['fnt'];
	const _SOUND   = attachments['snd'];



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.timeout = 30000;


		this.__pulse = {
			active:   false,
			duration: 500,
			start:    null,
			alpha:    0.0
		};


		this.setTimeout(states.timeout);

		delete states.timeout;


		states.width  = typeof states.width === 'number'  ? states.width  : 512;
		states.height = typeof states.height === 'number' ? states.height : 512;
		states.shape  = _Entity.SHAPE.rectangle;


		_Entity.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function(id, position, delta) {

			if (this.state === 'active') {
				// XXX: Do nothing
			}

			return false;

		}, this);

		this.bind('key', function(key, name, delta) {

			if (this.state === 'active') {
				// XXX: Do nothing
			}

			return false;

		}, this);

		this.bind('focus', function() {
			this.setState('default');
		}, this);

		this.bind('blur', function() {
			this.setState('default');
		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.entity.Timeout';


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


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


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

				renderer.setAlpha(alpha);

			}


			let label = '' + ((this.timeout / 1000) | 0);
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

			let pulse = this.__pulse;
			if (pulse.active === true) {

				if (pulse.start === null) {
					pulse.start = clock;
				}

				let t = (clock - pulse.start) / pulse.duration;
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

				let pulse = this.__pulse;


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

			visible = typeof visible === 'boolean' ? visible : null;


			if (visible !== null) {

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

				}


				return true;

			}


			return false;

		}

	};


	return Composite;

});

