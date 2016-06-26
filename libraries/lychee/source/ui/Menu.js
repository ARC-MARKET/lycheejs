
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
]).exports(function(lychee, global, attachments) {

	var _FONT = attachments["fnt"];



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.font    = _FONT;
		this.label   = 'MENU';
		this.options = [ 'Welcome', 'Settings', 'About' ];
		this.helpers = [];
		this.state   = 'default';
		this.value   = 'Welcome';

		this.__boundary = 0;
		this.__focus    = null;
		this.__helpers  = [];
		this.__states   = { 'default': null, 'active': null };


		this.setState(settings.state);
		this.setValue(settings.value);

		delete settings.state;
		delete settings.value;


		settings.width    = 144;
		settings.height   = 144;
		settings.alpha    = 0.0;
		settings.relayout = false;


		lychee.ui.Layer.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function(id, position, delta) {

			var min_y = -1/2 * this.height + 64;
			if (min_y > position.y) {

				if (this.state === 'active') {
					this.trigger('blur');
				} else {
					this.trigger('focus');
				}

			} else {

				var args = [ id, {
					x: 0,
					y: 0
				}, delta ];


				for (var h = 0, hl = this.__helpers.length; h < hl; h++) {

					var helper = this.__helpers[h];
					if (helper.visible === false) continue;

					if (helper.isAtPosition(position) === true) {

						args[1].x = position.x - helper.position.x;
						args[1].y = position.y - helper.position.y;

						helper.trigger('touch', args);

					}

				}

			}

		}, this);

		this.bind('key', function(key, name, delta) {

			if (this.state === 'active') {

				var entities = [ this.getEntity('@select') ].concat(this.__helpers);
				var focus    = this.__focus;
				var index    = entities.indexOf(focus);


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

			var focus = this.__focus;
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


				this.__boundary = -1/2 * width;
				this.position.x = -1/2 * width + this.width / 2;


				var entity = null;
				var x1     = -1/2 * this.width;
				var y1     = -1/2 * this.height;
				var x2     =  1/2 * this.width;
				var y2     =  1/2 * this.height;


				entity = this.getEntity('@label');
				entity.position.x = -52 + entity.width / 2;
				entity.position.y =  y1 + 21 + entity.height / 2;

				entity = this.getEntity('@select');
				entity.position.x = 8;
				entity.position.y = y1 + 64 + entity.height / 2;


				for (var h = 0, hl = this.__helpers.length; h < hl; h++) {

					entity = this.__helpers[h];
					entity.position.x = 0;
					entity.position.y = y2 - 16 - 32 * hl + 32 * h + 16 * h;

				}

			}

		}, this);


		this.setEntity('@label', new lychee.ui.entity.Label({
			font:  this.font,
			value: this.label
		}));

		this.setEntity('@select', new lychee.ui.entity.Select({
			options: this.options,
			value:   this.value
		}));

		this.getEntity('@select').bind('change', function(value) {

			var result = this.setValue(value);
			if (result === true) {
				this.trigger('change', [ value ]);
			}

		}, this);


		this.setFont(settings.font);
		this.setHelpers(settings.helpers);
		this.setLabel(settings.label);
		this.setOptions(settings.options);

		delete settings.font;
		delete settings.helpers;
		delete settings.label;
		delete settings.options;

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var font = lychee.deserialize(blob.font);
			if (font !== null) {
				this.setFont(font);
			}

		},

		serialize: function() {

			var data = lychee.ui.Layer.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.Menu';

			var settings = data['arguments'][0];
			var blob     = (data['blob'] || {});


			if (this.label !== 'MENU')     settings.label   = this.label;
			if (this.helpers.length !== 0) settings.helpers = this.helpers.slice(0, this.helpers.length);
			if (this.state !== 'default')  settings.state   = this.state;
			if (this.value !== 'Welcome')  settings.value   = this.value;

			if (this.options.join(',') !== 'Welcome,Settings,About') settings.options = this.options.slice(0, this.options.length);


			if (this.font !== null) blob.font = lychee.serialize(this.font);


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		update: function(clock, delta) {

			var helpers = this.__helpers;
			for (var h = 0, hl = helpers.length; h < hl; h++) {
				helpers[h].update(clock, delta);
			}


			lychee.ui.Layer.prototype.update.call(this, clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var alpha    = this.alpha;
			var helpers  = this.__helpers;
			var position = this.position;


			var x  = position.x + offsetX;
			var y  = position.y + offsetY;
			var x1 = x - this.width  / 2;
			var y1 = y - this.height / 2;
			var x2 = x + this.width  / 2;
			var y2 = y + this.height / 2;


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


			for (var h = 0, hl = helpers.length; h < hl; h++) {

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
				lychee.ui.Layer.prototype.render.call(this, renderer, offsetX, offsetY);
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

				this.helpers = helpers.map(function(helper) {
					return '' + helper;
				});


				this.__helpers = [];

				for (var h = 0, hl = this.helpers.length; h < hl; h++) {

					this.__helpers.push(new lychee.ui.entity.Helper({
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

				this.options = options.map(function(option) {
					return '' + option;
				});

				this.getEntity('@select').setOptions(this.options);


				return true;

			}


			return false;

		},

		setState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && this.__states[id] !== undefined) {

				if (id === 'active') {

					this.removeEffects();

					this.addEffect(new lychee.effect.Alpha({
						type:     lychee.effect.Alpha.TYPE.easeout,
						delay:    300,
						duration: 300,
						alpha:    1.0
					}));

					this.addEffect(new lychee.effect.Position({
						type:     lychee.effect.Position.TYPE.easeout,
						duration: 300,
						position: {
							x: this.__boundary + 70
						}
					}));

					this.addEffect(new lychee.effect.Width({
						type:     lychee.effect.Width.TYPE.easeout,
						duration: 300,
						width:    144
					}));

					this.getEntity('@label').addEffect(new lychee.effect.Visible({
						delay:   300,
						visible: true
					}));

					this.getEntity('@select').addEffect(new lychee.effect.Visible({
						delay:   300,
						visible: true
					}));

				} else {

					this.removeEffects();

					this.addEffect(new lychee.effect.Alpha({
						type:     lychee.effect.Alpha.TYPE.easeout,
						duration: 300,
						alpha:    0.0
					}));

					this.addEffect(new lychee.effect.Position({
						type:     lychee.effect.Position.TYPE.easeout,
						delay:    300,
						duration: 300,
						position: {
							x: this.__boundary + 30
						}
					}));

					this.addEffect(new lychee.effect.Width({
						type:     lychee.effect.Width.TYPE.easeout,
						delay:    300,
						duration: 300,
						width:     64
					}));

					this.getEntity('@label').addEffect(new lychee.effect.Visible({
						delay:   300,
						visible: false
					}));

					this.getEntity('@select').addEffect(new lychee.effect.Visible({
						delay:   300,
						visible: false
					}));

				}


				this.addEffect(new lychee.effect.Event({
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

				this.value = value;

				return true;

			}


			return false;

		}

	};


	return Class;

});

