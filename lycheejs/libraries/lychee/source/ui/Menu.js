
lychee.define('lychee.ui.Menu').requires([
	'lychee.effect.Alpha',
	'lychee.effect.Event',
	'lychee.effect.Position',
	'lychee.effect.Visible',
	'lychee.effect.Width',
	'lychee.ui.entity.Helper',
	'lychee.ui.entity.Label',
	'lychee.ui.entity.Select'
]).includes([
	'lychee.ui.Layer'
]).exports((lychee, global, attachments) => {

	const _Alpha    = lychee.import('lychee.effect.Alpha');
	const _Event    = lychee.import('lychee.effect.Event');
	const _Helper   = lychee.import('lychee.ui.entity.Helper');
	const _Label    = lychee.import('lychee.ui.entity.Label');
	const _Layer    = lychee.import('lychee.ui.Layer');
	const _Position = lychee.import('lychee.effect.Position');
	const _Select   = lychee.import('lychee.ui.entity.Select');
	const _Visible  = lychee.import('lychee.effect.Visible');
	const _Width    = lychee.import('lychee.effect.Width');
	const _FONT     = attachments['fnt'];



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.font    = _FONT;
		this.label   = 'MENU';
		this.options = [ 'Settings' ];
		this.helpers = [];
		this.state   = 'default';
		this.states  = { 'default': null, 'active': null };
		this.value   = 'Settings';

		this.__boundary = 0;
		this.__focus    = null;
		this.__helpers  = [];


		this.setState(states.state);
		this.setValue(states.value);

		delete states.state;
		delete states.value;


		states.width    = 144;
		states.height   = 144;
		states.alpha    = 0.0;
		states.relayout = false;


		_Layer.call(this, states);



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function(id, position, delta) {

			let min_y = -1 / 2 * this.height + 64;
			if (min_y > position.y) {

				if (this.state === 'active') {
					this.trigger('blur');
				} else {
					this.trigger('focus');
				}

			} else {

				let found = null;
				let args  = [ id, {
					x: 0,
					y: 0
				}, delta ];


				for (let h = 0, hl = this.__helpers.length; h < hl; h++) {

					let helper = this.__helpers[h];
					if (helper.visible === false) continue;

					if (helper.confines(position) === true) {

						args[1].x = position.x - helper.position.x;
						args[1].y = position.y - helper.position.y;

						helper.trigger('touch', args);
						found = helper;

						break;

					}

				}


				return found;

			}

		}, this);

		this.bind('key', function(key, name, delta) {

			if (this.state === 'active') {

				let entities = [ this.getEntity('@select') ].concat(this.__helpers);
				let focus    = this.__focus;
				let index    = entities.indexOf(focus);


				if (name === 'tab') {

					if (focus !== null) {
						focus.trigger('blur');
					}

					index += 1;
					index %= entities.length;
					focus  = entities[index];
					focus.trigger('focus');

					this.__focus = focus;


					return true;

				} else if (name === 'shift-tab') {

					if (focus !== null) {
						focus.trigger('blur');
					}

					index -= 1;
					index  = index < 0 ? 0 : index;
					focus  = entities[index];
					focus.trigger('focus');

					this.__focus = focus;


					return true;

				} else if (focus !== null) {

					focus.trigger('key', [ key, name, delta ]);


					return true;

				}


			}


			return false;

		}, this);

		this.bind('focus', function() {
			this.setState('active');
		}, this);

		this.bind('blur', function() {

			this.setState('default');

			let focus = this.__focus;
			if (focus !== null) {
				focus.trigger('blur');
				this.__focus = null;
			}

		}, this);

		this.bind('reshape', function(orientation, rotation, width, height) {

			if (typeof width === 'number' && typeof height === 'number') {

				if (this.state === 'active') {
					this.width  = 144;
					this.height = height;
				} else {
					this.width  = 64;
					this.height = height;
				}


				this.__boundary = -1 / 2 * width;
				this.position.x = -1 / 2 * width + this.width / 2;


				let entity = null;
				let y1     = -1 / 2 * this.height;
				let y2     =  1 / 2 * this.height;


				entity = this.getEntity('@label');
				entity.position.x = -52 + entity.width / 2;
				entity.position.y =  y1 + 21 + entity.height / 2;

				entity = this.getEntity('@select');
				entity.height     = 32 * entity.options.length;
				entity.position.x = 8;
				entity.position.y = y1 + 64 + entity.height / 2;


				for (let h = 0, hl = this.__helpers.length; h < hl; h++) {

					entity = this.__helpers[h];
					entity.position.x = 0;
					entity.position.y = y2 - 16 - 32 * hl + 32 * h + 16 * h;

				}

			}

		}, this);


		this.setEntity('@label', new _Label({
			font:  this.font,
			value: this.label
		}));

		this.setEntity('@select', new _Select({
			options: this.options,
			value:   this.value
		}));

		this.getEntity('@select').bind('change', function(value) {

			let oldvalue = this.value;
			if (oldvalue !== value) {

				let result = this.setValue(value);
				if (result === true) {
					this.trigger('change', [ value ]);
				}

			}

		}, this);


		this.setFont(states.font);
		this.setHelpers(states.helpers);
		this.setLabel(states.label);
		this.setOptions(states.options);

		delete states.font;
		delete states.helpers;
		delete states.label;
		delete states.options;

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			let font = lychee.deserialize(blob.font);
			if (font !== null) {
				this.setFont(font);
			}

		},

		serialize: function() {

			let data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.Menu';

			let states = data['arguments'][0];
			let blob   = (data['blob'] || {});


			if (this.label !== 'MENU')                 states.label   = this.label;
			if (this.helpers.length !== 0)             states.helpers = this.helpers.slice(0, this.helpers.length);
			if (this.state !== 'default')              states.state   = this.state;
			if (this.value !== 'Settings')             states.value   = this.value;
			if (this.options.join(',') !== 'Settings') states.options = this.options.slice(0, this.options.length);


			if (this.font !== null) blob.font = lychee.serialize(this.font);


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		update: function(clock, delta) {

			let helpers = this.__helpers;
			for (let h = 0, hl = helpers.length; h < hl; h++) {
				helpers[h].update(clock, delta);
			}


			_Layer.prototype.update.call(this, clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let alpha    = this.alpha;
			let helpers  = this.__helpers;
			let position = this.position;


			let x  = position.x + offsetX;
			let y  = position.y + offsetY;
			let x1 = x - this.width  / 2;
			let y1 = y - this.height / 2;
			let x2 = x + this.width  / 2;
			let y2 = y + this.height / 2;


			renderer.drawBox(
				x1,
				y1,
				x2,
				y2,
				'#363f3e',
				true
			);

			renderer.drawBox(
				x2 - 48,
				y1 + 20,
				x2 - 16,
				y1 + 22,
				'#ffffff',
				true
			);

			renderer.drawBox(
				x2 - 48,
				y1 + 31,
				x2 - 16,
				y1 + 33,
				'#ffffff',
				true
			);

			renderer.drawBox(
				x2 - 48,
				y1 + 42,
				x2 - 16,
				y1 + 44,
				'#ffffff',
				true
			);


			for (let h = 0, hl = helpers.length; h < hl; h++) {

				helpers[h].render(
					renderer,
					x,
					y
				);

			}


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			if (alpha !== 0) {
				_Layer.prototype.render.call(this, renderer, offsetX, offsetY);
			}


			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}

		},



		/*
		 * CUSTOM API
		 */

		setFont: function(font) {

			font = font instanceof Font ? font : null;


			if (font !== null) {

				this.getEntity('@label').setFont(font);
				this.font = font;


				return true;

			}


			return false;

		},

		setHelpers: function(helpers) {

			helpers = helpers instanceof Array ? helpers : null;


			if (helpers !== null) {

				this.helpers = helpers.map(helper => '' + helper);


				this.__helpers = [];

				for (let h = 0, hl = this.helpers.length; h < hl; h++) {

					this.__helpers.push(new _Helper({
						width:  32,
						height: 32,
						label:  null,
						value:  this.helpers[h],
						position: {
							x: 0,
							y: (this.height / 2) - 16 - 32 * hl + 32 * h + 16 * h
						}
					}));

				}


				return true;

			}


			return false;

		},

		setLabel: function(label) {

			label = typeof label === 'string' ? label : null;


			if (label !== null) {

				this.getEntity('@label').setValue(label);
				this.label = label;


				return true;

			}


			return false;

		},

		setOptions: function(options) {

			options = options instanceof Array ? options : null;


			if (options !== null) {

				this.options = options.map(option => '' + option);
				this.getEntity('@select').setOptions(this.options);


				return true;

			}


			return false;

		},

		setState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && id !== this.state && this.states[id] !== undefined) {

				if (id === 'active') {

					this.removeEffects();

					this.addEffect(new _Alpha({
						type:     _Alpha.TYPE.easeout,
						delay:    300,
						duration: 300,
						alpha:    1.0
					}));

					this.addEffect(new _Position({
						type:     _Position.TYPE.easeout,
						duration: 300,
						position: {
							x: this.__boundary + 70
						}
					}));

					this.addEffect(new _Width({
						type:     _Width.TYPE.easeout,
						duration: 300,
						width:    144
					}));

					this.getEntity('@label').addEffect(new _Visible({
						delay:   300,
						visible: true
					}));

					this.getEntity('@select').addEffect(new _Visible({
						delay:   300,
						visible: true
					}));

				} else {

					this.removeEffects();

					this.addEffect(new _Alpha({
						type:     _Alpha.TYPE.easeout,
						duration: 300,
						alpha:    0.0
					}));

					this.addEffect(new _Position({
						type:     _Position.TYPE.easeout,
						delay:    300,
						duration: 300,
						position: {
							x: this.__boundary + 30
						}
					}));

					this.addEffect(new _Width({
						type:     _Width.TYPE.easeout,
						delay:    300,
						duration: 300,
						width:     64
					}));

					this.getEntity('@label').addEffect(new _Visible({
						delay:   300,
						visible: false
					}));

					this.getEntity('@select').addEffect(new _Visible({
						delay:   300,
						visible: false
					}));

				}


				this.addEffect(new _Event({
					delay: 600,
					event: 'relayout'
				}));


				this.state = id;

				return true;

			}


			return false;

		},

		setValue: function(value) {

			value = typeof value === 'string' ? value : null;


			if (value !== null) {

				let oldvalue = this.value;
				if (oldvalue !== value) {

					this.value = value;

					let select = this.getEntity('@select');
					if (select.value !== value) {
						select.setValue(value);
					}

				}


				return true;

			}


			return false;

		}

	};


	return Composite;

});

