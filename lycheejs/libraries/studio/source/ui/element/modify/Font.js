
lychee.define('studio.ui.element.modify.Font').requires([
	'studio.codec.FONT',
	// 'studio.ui.entity.input.Font',
	'lychee.ui.entity.Input',
	'studio.ui.entity.input.Font',
	'lychee.ui.entity.Select',
	'lychee.ui.entity.Slider'
]).includes([
	'lychee.ui.Element'
]).exports((lychee, global, attachments) => {

	const _Element = lychee.import('lychee.ui.Element');
	const _Font    = lychee.import('studio.ui.entity.input.Font');
	const _Input   = lychee.import('lychee.ui.entity.Input');
	const _Select  = lychee.import('lychee.ui.entity.Select');
	const _Slider  = lychee.import('lychee.ui.entity.Slider');
	const _FONT    = lychee.import('studio.codec.FONT');
	let   _TIMEOUT = Date.now();



	/*
	 * HELPERS
	 */

	const _on_change = function() {

		if (Date.now() > _TIMEOUT + 100) {

			let settings = this.__settings;
			let value    = _FONT.encode(settings);
			if (value !== null) {

				if (this.value !== null) {
					value.url = this.value.url;
				}

				this.value = value;
				this.trigger('change', [ this.value ]);

			}


			_TIMEOUT = 0;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.value = null;

		this.__settings = {
			spacing: 0,
			font: {
				family:  'Ubuntu Mono',
				color:   '#ffffff',
				size:    16,
				style:   'normal',
				outline: 1
			}
		};


		states.label   = 'Modify';
		states.options = [];


		_Element.call(this, states);



		/*
		 * INITIALIZATION
		 */

		this.setEntity('family', new _Input({
			type:  _Input.TYPE.text,
			value: 'Ubuntu Mono'
		}));

		this.setEntity('color', new _Input({
			type:  _Input.TYPE.text,
			value: '#ffffff'
		}));

		this.setEntity('size', new _Slider({
			max:   128,
			min:   8,
			step:  4,
			type:  _Slider.TYPE.horizontal,
			value: 16
		}));

		this.setEntity('style', new _Select({
			options: [ 'normal', 'bold', 'italic' ],
			value:   'normal'
		}));

		this.setEntity('outline', new _Slider({
			max:   8,
			min:   0,
			step:  1,
			type:  _Slider.TYPE.horizontal,
			value: 1
		}));

		this.setEntity('spacing', new _Slider({
			max:   16,
			min:   0,
			step:  1,
			type:  _Slider.TYPE.horizontal,
			value: 0
		}));


		this.getEntity('family').bind('change', function(value) {

			this.__settings.font.family = value;

			_TIMEOUT = Date.now();
			setTimeout(_on_change.bind(this), 150);

		}, this);

		this.getEntity('color').bind('change', function(value) {

			this.__settings.font.color = value;

			_TIMEOUT = Date.now();
			setTimeout(_on_change.bind(this), 150);

		}, this);

		this.getEntity('size').bind('change', function(value) {

			this.__settings.font.size = value;

			_TIMEOUT = Date.now();
			setTimeout(_on_change.bind(this), 150);

		}, this);

		this.getEntity('style').bind('change', function(value) {

			this.__settings.font.style = value;

			_TIMEOUT = Date.now();
			setTimeout(_on_change.bind(this), 150);

		}, this);

		this.getEntity('outline').bind('change', function(value) {

			this.__settings.font.outline = value;

			_TIMEOUT = Date.now();
			setTimeout(_on_change.bind(this), 150);

		}, this);

		this.getEntity('spacing').bind('change', function(value) {

			this.__settings.spacing = value;

			_TIMEOUT = Date.now();
			setTimeout(_on_change.bind(this), 150);

		}, this);


		this.setValue(states.value);
		this.trigger('relayout');

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'studio.ui.element.modify.Font';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setValue: function(value) {

			value = value instanceof Font ? value : null;


			if (value !== null) {

				this.value = value;
				this.setOptions([]);


				if (value.__font === null) {
					value.__font = {};
				}


				let buffer    = value.__font;
				let s_spacing = typeof value.spacing === 'number'  ? value.spacing  : null;
				let s_family  = typeof buffer.family === 'string'  ? buffer.family  : null;
				let s_color   = typeof buffer.color === 'string'   ? buffer.color   : null;
				let s_size    = typeof buffer.size === 'number'    ? buffer.size    : null;
				let s_style   = typeof buffer.style === 'string'   ? buffer.style   : null;
				let s_outline = typeof buffer.outline === 'number' ? buffer.outline : null;


				if (s_spacing !== null) {
					this.getEntity('spacing').setValue(s_spacing);
					this.__settings.spacing = s_spacing;
				}

				if (s_family !== null) {
					this.getEntity('family').setValue(s_family);
					this.__settings.font.family = s_family;
				}

				if (s_color !== null) {
					this.getEntity('color').setValue(s_color);
					this.__settings.font.color = s_color;
				}

				if (s_size !== null) {
					this.getEntity('size').setValue(s_size);
					this.__settings.font.size = s_size;
				}

				if (s_style !== null) {
					this.getEntity('style').setValue(s_style);
					this.__settings.font.style = s_style;
				}

				if (s_outline !== null) {
					this.getEntity('outline').setValue(s_outline);
					this.__settings.font.outline = s_outline;
				}


				return true;

			}


			return false;

		}

	};


	return Composite;

});

