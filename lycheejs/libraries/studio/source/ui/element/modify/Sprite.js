
lychee.define('studio.ui.element.modify.Sprite').requires([
	'studio.codec.SPRITE',
	'lychee.app.Entity',
	'lychee.ui.entity.Upload',
	'lychee.ui.entity.Input',
	'lychee.ui.entity.Select'
]).includes([
	'lychee.ui.Element'
]).exports((lychee, global, attachments) => {

	const _Element = lychee.import('lychee.ui.Element');
	const _Entity  = lychee.import('lychee.app.Entity');
	const _Input   = lychee.import('lychee.ui.entity.Input');
	const _Select  = lychee.import('lychee.ui.entity.Select');
	const _Upload  = lychee.import('lychee.ui.entity.Upload');
	const _SPRITE  = lychee.import('studio.codec.SPRITE');
	let   _TIMEOUT = Date.now();



	/*
	 * HELPERS
	 */

	const _on_change = function() {

		if (Date.now() > _TIMEOUT + 100) {

			let settings = this.__settings;
			let value    = _SPRITE.encode({
				shape:    settings.shape    || _Entity.SHAPE.rectangle,
				width:    settings.width    || null,
				height:   settings.height   || null,
				depth:    settings.depth    || null,
				textures: settings.textures || []
			});


			if (value !== null) {

				if (this.value !== null) {
					value.config.url  = this.value.config.url;
					value.texture.url = this.value.texture.url;
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
			shape:    _Entity.SHAPE.rectangle,
			width:    null,
			height:   null,
			depth:    null,
			radius:   null,
			textures: []
		};


		states.label   = 'Modify';
		states.options = [];


		_Element.call(this, states);



		/*
		 * INITIALIZATION
		 */

		this.setEntity('textures', new _Upload({
			type: _Upload.TYPE.texture
		}));

		this.setEntity('shape', new _Select({
			options: [ 'circle', 'rectangle', 'sphere', 'cuboid' ],
			value:   'rectangle'
		}));

		this.setEntity('width', new _Input({
			type:    _Input.TYPE.number,
			min:     0,
			visible: true
		}));

		this.setEntity('height', new _Input({
			type:    _Input.TYPE.number,
			min:     0,
			visible: true
		}));

		this.setEntity('depth', new _Input({
			type:    _Input.TYPE.number,
			min:     0,
			visible: false
		}));
		this.entities[10].visible = false;

		this.setEntity('radius', new _Input({
			type:    _Input.TYPE.number,
			min:     0,
			visible: false
		}));
		this.entities[12].visible = false;


		this.getEntity('textures').bind('change', function(value) {
			this.__settings.textures = value;
		}, this);

		this.getEntity('shape').bind('change', function(val) {

			let value = _Entity.SHAPE[val] !== undefined ? _Entity.SHAPE[val] : null;
			if (value !== null) {

				this.__settings.shape = value;


				let entities = {
					width:  [ this.entities[6],  this.getEntity('width')  ],
					height: [ this.entities[8],  this.getEntity('height') ],
					depth:  [ this.entities[10], this.getEntity('depth')  ],
					radius: [ this.entities[12], this.getEntity('radius') ]
				};

				for (let id in entities) {
					entities[id][0].visible = false;
					entities[id][1].visible = false;
				}


				if (value === _Entity.SHAPE.circle) {

					entities.radius[0].visible = true;
					entities.radius[1].visible = true;

				} else if (value === _Entity.SHAPE.rectangle) {

					entities.width[0].visible  = true;
					entities.width[1].visible  = true;
					entities.height[0].visible = true;
					entities.height[1].visible = true;

				} else if (value === _Entity.SHAPE.sphere) {

					entities.radius[0].visible = true;
					entities.radius[1].visible = true;

				} else if (value === _Entity.SHAPE.cuboid) {

					entities.width[0].visible  = true;
					entities.width[1].visible  = true;
					entities.height[0].visible = true;
					entities.height[1].visible = true;
					entities.depth[0].visible  = true;
					entities.depth[1].visible  = true;

				}


				_TIMEOUT = Date.now();
				setTimeout(_on_change.bind(this), 150);
				this.trigger('relayout');

			}

		}, this);

		this.getEntity('width').bind('change', function(value) {

			this.__settings.width = value;

			_TIMEOUT = Date.now();
			setTimeout(_on_change.bind(this), 150);

		}, this);

		this.getEntity('height').bind('change', function(value) {

			this.__settings.height = value;

			_TIMEOUT = Date.now();
			setTimeout(_on_change.bind(this), 150);

		}, this);

		this.getEntity('depth').bind('change', function(value) {

			this.__settings.depth = value;

			_TIMEOUT = Date.now();
			setTimeout(_on_change.bind(this), 150);

		}, this);

		this.getEntity('radius').bind('change', function(value) {

			this.__settings.radius = value;

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
			data['constructor'] = 'studio.ui.element.modify.Sprite';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setValue: function(value) {

			value = value instanceof Object ? value : null;


			if (value !== null) {

				this.value = value;
				this.setOptions([]);


				let texture = value.texture || null;
				if (texture !== null) {
					this.__settings.textures = [ texture ];
				}


				if (value.config.buffer === null) {
					value.config.buffer = {};
				}


				let buffer   = value.config.buffer;
				let s_shape  = typeof buffer.shape === 'number'  ? buffer.shape  : null;
				let s_width  = typeof buffer.width === 'number'  ? buffer.width  : null;
				let s_height = typeof buffer.height === 'number' ? buffer.height : null;
				let s_depth  = typeof buffer.depth === 'number'  ? buffer.depth  : null;
				let s_radius = typeof buffer.radius === 'number' ? buffer.radius : null;


				if (s_shape !== null) {

					if (lychee.enumof(_Entity.SHAPE, s_shape) === true) {

						let tmp1 = Object.keys(_Entity.SHAPE);
						let tmp2 = Object.values(_Entity.SHAPE);
						let tmp3 = tmp1[tmp2.indexOf(s_shape)];

						this.getEntity('shape').setValue(tmp3);
						this.__settings.shape = s_shape;

					}

				}

				if (s_width !== null) {
					this.getEntity('width').setValue(s_width);
					this.__settings.width = s_width;
				}

				if (s_height !== null) {
					this.getEntity('height').setValue(s_height);
					this.__settings.height = s_height;
				}

				if (s_depth !== null) {
					this.getEntity('depth').setValue(s_depth);
					this.__settings.depth = s_depth;
				}

				if (s_radius !== null) {
					this.getEntity('radius').setValue(s_radius);
					this.__settings.radius = s_radius;
				}


				return true;

			}


			return false;

		}

	};


	return Composite;

});

