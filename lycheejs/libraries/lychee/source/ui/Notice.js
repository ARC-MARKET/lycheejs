
lychee.define('lychee.ui.Notice').requires([
	'lychee.effect.Alpha',
	'lychee.effect.Position',
	'lychee.effect.State',
	'lychee.ui.entity.Button',
	'lychee.ui.entity.Label'
]).includes([
	'lychee.ui.Layer'
]).exports((lychee, global, attachments) => {

	const _Alpha    = lychee.import('lychee.effect.Alpha');
	const _Button   = lychee.import('lychee.ui.entity.Button');
	const _Label    = lychee.import('lychee.ui.entity.Label');
	const _Layer    = lychee.import('lychee.ui.Layer');
	const _Position = lychee.import('lychee.effect.Position');
	const _State    = lychee.import('lychee.effect.State');
	const _FONT     = attachments['fnt'];



	/*
	 * HELPERS
	 */

	const _on_relayout = function() {

		let button = this.getEntity('@options-next');
		let label  = this.getEntity('@label');
		let x2     = 1 / 2 * this.width;


		if (button.visible === true) {
			label.position.x = -48 - 8;
		} else {
			label.position.x = 0;
		}


		button.width      = 96;
		button.position.x = x2 - button.width / 2 - 16;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.font    = _FONT;
		this.label   = 'Changes applied.';
		this.options = [ 'Undo' ];
		this.state   = 'default';
		this.states  = { 'default': null, 'active': null };

		this.__boundary = 0;


		this.setState(states.state);

		delete states.state;


		states.width    = 512;
		states.height   =  64;
		states.alpha    = 0.0;
		states.relayout = false;


		_Layer.call(this, states);



		/*
		 * INITIALIZATION
		 */

		this.unbind('touch');
		this.bind('touch', function(id, position, delta) {

			let button = this.getEntity('@options-next');
			if (button.visible === true && button.confines(position) === true) {

				button.trigger('touch', [ id, {
					x: position.x - button.position.x,
					y: position.y - button.position.y
				}, delta ]);

				return button;

			}

		}, this);

		this.bind('relayout', _on_relayout, this);
		this.bind('reshape',  function(orientation, rotation, width, height) {

			if (typeof width === 'number' && typeof height === 'number') {

				this.__boundary = 1 / 2 * height;
				this.position.y = 1 / 2 * height + this.height / 2;

				_on_relayout.call(this);

			}

		}, this);


		this.setEntity('@label', new _Label({
			font:  this.font,
			value: this.label
		}));

		this.setEntity('@options-next', new _Button({
			label: this.options[0],
			value: this.options[0].toLowerCase()
		}));


		this.getEntity('@options-next').bind('change', function(value) {
			console.log('WHAT');
			this.trigger('change', [ value ]);
		}, this);


		this.setFont(states.font);
		this.setLabel(states.label);
		this.setOptions(states.options);

		delete states.font;
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
			data['constructor'] = 'lychee.ui.Notice';

			let states = data['arguments'][0];
			let blob   = (data['blob'] || {});


			if (this.label !== 'Changes applied.') states.label   = this.label;
			if (this.options.join(',') !== 'Undo') states.options = this.options.slice(0, this.options.length);
			if (this.state !== 'default')          states.state   = this.state;


			if (this.font !== null) blob.font = lychee.serialize(this.font);


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let alpha    = this.alpha;
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


				let next = this.getEntity('@options-next');

				if (this.options.length === 0) {

					next.visible = false;
					this.trigger('relayout');

				} else if (this.options.length === 1) {

					next.visible = true;
					next.setLabel(this.options[0]);
					next.setValue(this.options[0].toLowerCase());
					this.trigger('relayout');

				}


				return true;

			}


			return false;

		},

		setState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && id !== this.state && this.states[id] !== undefined) {

				if (id === 'active') {

					this.removeEffects();

					this.setPosition({
						y: this.__boundary + this.height / 2
					});

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
							y: this.__boundary - this.height / 2
						}
					}));

					this.addEffect(new _State({
						delay: 3000,
						state: 'default'
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
							y: this.__boundary + this.height / 2
						}
					}));

				}


				this.state = id;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

