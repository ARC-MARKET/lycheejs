
lychee.define('lychee.ui.entity.Joystick').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global, attachments) {

	const _Entity = lychee.import('lychee.ui.Entity');



	/*
	 * HELPERS
	 */

	const _update_cursor = function() {

		let val = this.value;
		let map = this.__cursor.map;


		map.x = (val.x / 2) * (this.width  - 44);
		map.y = (val.y / 2) * (this.height - 44);


		this.__isDirty = false;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.value = { x: 0, y: 0 };

		this.__cursor = {
			active:   false,
			alpha:    0.0,
			duration: 600,
			start:    null,
			pingpong: false,
			map:      {
				x: 0,
				y: 0
			}
		};
		this.__pulse = {
			active:   false,
			duration: 300,
			start:    null,
			alpha:    0.0
		};
		this.__isDirty = true;


		this.setValue(settings.value);

		delete settings.value;


		settings.width  = typeof settings.width === 'number'  ? settings.width  : 128;
		settings.height = typeof settings.height === 'number' ? settings.height : 128;
		settings.shape  = _Entity.SHAPE.rectangle;


		_Entity.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('relayout', function() {
			this.__isDirty = true;
		}, this);

		this.bind('touch', function(id, position, delta) {

			let val = { x: 0, y: 0 };
			let qx  = Math.max(-0.5, Math.min(0.5, position.x / (this.width  - 44)));
			let qy  = Math.max(-0.5, Math.min(0.5, position.y / (this.height - 44)));

			val.x = qx * 2;
			val.y = qy * 2;


			let result = this.setValue(val);
			if (result === true) {
				this.trigger('change', [ val ]);
			}

		}, this);

		this.bind('swipe', function(id, state, position, delta, swipe) {

			let val = { x: 0, y: 0 };
			let qx  = Math.max(-0.5, Math.min(0.5, position.x / (this.width  - 44)));
			let qy  = Math.max(-0.5, Math.min(0.5, position.y / (this.height - 44)));

			val.x = qx * 2;
			val.y = qy * 2;


			let result = this.setValue(val);
			if (result === true) {
				this.trigger('change', [ val ]);
			}

		}, this);

		this.bind('key', function(key, name, delta) {

			if (this.state === 'active') {

				let val = { x: this.value.x, y: this.value.y };

				if (key === 'a' || key === 'arrow-left')  { val.x = -1.0; val.y = 0.0; }
				if (key === 'd' || key === 'arrow-right') { val.x =  1.0; val.y = 0.0; }
				if (key === 'w' || key === 'arrow-up')    { val.y = -1.0; val.x = 0.0; }
				if (key === 's' || key === 'arrow-down')  { val.y =  1.0; val.x = 0.0; }

				if (key === 'enter' || key === 'space') {
					val.x = 0;
					val.y = 0;
				}


				let result = this.setValue(val);
				if (result === true) {
					this.trigger('change', [ val ]);
				}

			}

		}, this);

		this.bind('focus', function() {
			this.setState('active');
		}, this);

		this.bind('blur', function() {

			this.setValue({ x: 0, y: 0 });
			this.setState('default');

		}, this);


		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.entity.Joystick';

			let settings = data['arguments'][0];
			let blob     = (data['blob'] || {});


			if (this.value.x !== 0 || this.value.y !== 0) {

				settings.value = {};

				if (this.value.x !== 0) settings.value.x = this.value.x;
				if (this.value.y !== 0) settings.value.y = this.value.y;

			}


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		update: function(clock, delta) {

			let pulse = this.__pulse;
			if (pulse.active === true) {

				if (pulse.start === null) {
					pulse.start = clock;
				}

				let pt = (clock - pulse.start) / pulse.duration;
				if (pt <= 1) {
					pulse.alpha = (1 - pt);
				} else {
					pulse.alpha  = 0.0;
					pulse.active = false;
				}

			}


			let cursor = this.__cursor;
			if (cursor.active === true) {

				if (cursor.start === null) {
					cursor.start = clock;
				}


				let ct = (clock - cursor.start) / cursor.duration;
				if (ct <= 1) {
					cursor.alpha = cursor.pingpong === true ? (1 - ct) : ct;
				} else {
					cursor.start    = clock;
					cursor.pingpong = !cursor.pingpong;
				}

			}


			if (this.__isDirty === true) {
				_update_cursor.call(this);
			}


			_Entity.prototype.update.call(this, clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let alpha    = this.alpha;
			let position = this.position;
			let cursor   = this.__cursor;
			let x        = position.x + offsetX;
			let y        = position.y + offsetY;
			let hwidth   = (this.width  - 2) / 2;
			let hheight  = (this.height - 2) / 2;


			let col = this.state === 'active' ? '#32afe5' : '#545454';
			let map = cursor.map;
			let cx  = x + map.x;
			let cy  = y + map.y;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}

			renderer.drawBox(
				x - hwidth,
				y - hheight,
				x + hwidth,
				y + hheight,
				col,
				false,
				2
			);

			renderer.drawBox(
				x - hwidth  + 9,
				y - hheight + 9,
				x + hwidth  - 9,
				y + hheight - 9,
				col,
				false,
				1
			);

			renderer.drawLine(
				x - hwidth  + 10,
				y,
				x + hwidth  - 10,
				y,
				col,
				false,
				1
			);

			renderer.drawLine(
				x,
				y - hheight + 10,
				x,
				y + hheight - 10,
				col,
				false,
				1
			);

			renderer.drawCircle(
				cx,
				cy,
				11,
				col,
				false,
				2
			);

			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}


			if (cursor.active === true) {

				renderer.setAlpha(cursor.alpha);

				renderer.drawCircle(
					cx,
					cy,
					12,
					'#32afe5',
					true
				);

				renderer.setAlpha(1.0);

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

				renderer.setAlpha(1.0);

			}

		},



		/*
		 * CUSTOM API
		 */

		setState: function(id) {

			let result = _Entity.prototype.setState.call(this, id);
			if (result === true) {

				let cursor = this.__cursor;
				let pulse  = this.__pulse;


				if (id === 'active') {

					cursor.start  = null;
					cursor.active = true;

					pulse.alpha   = 1.0;
					pulse.start   = null;
					pulse.active  = true;

				} else {

					cursor.active = false;

				}


				return true;

			}


			return false;

		},

		setValue: function(value) {

			if (value instanceof Object) {

				this.value.x = typeof value.x === 'number' ? value.x : this.value.x;
				this.value.y = typeof value.y === 'number' ? value.y : this.value.y;


				let val = 0;

				val = this.value.x;
				val = val >= -1.0 ? val : -1.0;
				val = val <=  1.0 ? val :  1.0;
				this.value.x = val;

				val = this.value.y;
				val = val >= -1.0 ? val : -1.0;
				val = val <=  1.0 ? val :  1.0;
				this.value.y = val;


				this.__isDirty = true;


				return true;

			}


			return false;

		}

	};


	return Composite;

});

