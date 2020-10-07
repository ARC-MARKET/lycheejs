
lychee.define('lychee.app.layer.Table').requires([
	'lychee.effect.Alpha',
	'lychee.app.Entity',
	'lychee.app.entity.Label'
]).includes([
	'lychee.app.Layer'
]).exports((lychee, global, attachments) => {

	const _Alpha  = lychee.import('lychee.effect.Alpha');
	const _Entity = lychee.import('lychee.app.Entity');
	const _Label  = lychee.import('lychee.app.entity.Label');
	const _Layer  = lychee.import('lychee.app.Layer');
	const _FONT   = attachments['fnt'];



	/*
	 * HELPERS
	 */

	const _on_change = function(entity) {

		let index = this.entities.indexOf(entity);
		if (index !== -1) {

			let label  = Object.keys(this.model);
			let object = {};

			for (let e = Math.floor(index / label.length) * label.length, el = e + label.length; e < el; e++) {

				let property = label[e % label.length];
				let value    = this.entities[e].value;

				object[property] = value;

			}


			if (Object.keys(object).length > 0) {
				this.trigger('change', [ entity, object ]);
			}

		}

	};

	const _on_relayout = function() {

		let entities = this.entities;
		let label    = this.__label;
		let type     = this.type;
		let value    = this.value;
		let x1       = -1 / 2 * this.width;
		let y1       = -1 / 2 * this.height;
		let dim_x    = 0;
		let dim_y    = 0;
		let off_x    = 0;
		let off_y    = 0;


		if (type === Composite.TYPE.horizontal) {

			off_x = 0;
			off_y = 64;
			dim_x = this.width / label.length;
			dim_y = 0;


			for (let v = 0, vl = value.length; v < vl; v++) {

				dim_y = 0;

				for (let l = 0, ll = label.length; l < ll; l++) {
					dim_y = Math.max(dim_y, entities[v * ll + l].height + 32);
				}


				for (let l = 0, ll = label.length; l < ll; l++) {

					let entity = entities[v * ll + l];


					entity.alpha = 0.0;
					entity.addEffect(new lychee.effect.Alpha({
						type:     lychee.effect.Alpha.TYPE.easeout,
						duration: 300
					}));

					entity.position.x = x1 + off_x + dim_x / 2;
					entity.position.y = y1 + off_y + dim_y / 2;


					off_x += dim_x;

				}


				off_x  = 0;
				off_y += dim_y;

			}

		} else if (type === Composite.TYPE.vertical) {

			off_x = 128;
			off_y = 0;
			dim_x = (this.width - 128) / value.length;
			dim_y = 0;


			for (let l = 0, ll = label.length; l < ll; l++) {

				dim_y = 0;

				for (let v = 0, vl = value.length; v < vl; v++) {
					dim_y = Math.max(dim_y, entities[v * ll + l].height + 32);
				}


				for (let v = 0, vl = value.length; v < vl; v++) {

					let entity = entities[v * ll + l];


					entity.alpha = 0.0;
					entity.addEffect(new lychee.effect.Alpha({
						type:     lychee.effect.Alpha.TYPE.easeout,
						duration: 300
					}));

					entity.position.x = x1 + off_x + dim_x / 2;
					entity.position.y = y1 + off_y + dim_y / 2;


					off_x += dim_x;

				}


				off_x  = 128;
				off_y += dim_y;

			}

		}

	};

	const _render_buffer = function(renderer) {

		if (this.__buffer !== null) {
			this.__buffer.resize(this.width, this.height);
		} else {
			this.__buffer = renderer.createBuffer(this.width, this.height);
		}


		renderer.clear(this.__buffer);
		renderer.setBuffer(this.__buffer);
		renderer.setAlpha(1.0);


		let entities = this.entities;
		let offset   = this.offset;
		let el       = entities.length;
		if (el > 0) {

			let ox = this.width  / 2 + offset.x;
			let oy = this.height / 2 + offset.y;

			for (let e = 0; e < el; e++) {

				entities[e].render(
					renderer,
					ox,
					oy
				);

			}

		}


		renderer.setBuffer(null);

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.font  = _FONT;
		this.model = {};
		this.type  = Composite.TYPE.horizontal;
		this.value = [];

		this.__cache  = [];
		this.__buffer = null;
		this.__label  = [];


		this.setFont(states.font);
		this.setModel(states.model);
		this.setType(states.type);
		this.setValue(states.value);


		if (this.type === Composite.TYPE.horizontal) {
			states.width  = typeof states.width === 'number'  ? states.width  : 512;
			states.height = typeof states.height === 'number' ? states.height : 384;
		} else if (this.type === Composite.TYPE.vertical) {
			states.width  = typeof states.width === 'number'  ? states.width  : 384;
			states.height = typeof states.height === 'number' ? states.height : 512;
		}

		states.shape    = _Entity.SHAPE.rectangle;
		states.relayout = false;


		_Layer.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.unbind('relayout');
		this.bind('relayout', _on_relayout, this);

	};


	Composite.TYPE = {
		horizontal: 0,
		vertical:   1
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


			if (blob.model instanceof Object) {

				let model = {};

				for (let property in blob.model) {
					model[property] = lychee.deserialize(blob.model[property]);
				}

				this.setModel(model);

			}


			if (blob.value instanceof Array) {
				this.setValue(blob.value);
			}

		},

		serialize: function() {

			let data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'lychee.app.layer.Table';

			let states = data['arguments'][0];
			let blob   = (data['blob'] || {});


			if (this.type !== Composite.TYPE.horizontal) states.type = this.type;


			if (this.font !== null) blob.font = lychee.serialize(this.font);


			if (Object.keys(this.model).length !== 0) {

				blob.model = {};

				for (let property in this.model) {
					blob.model[property] = this.model[property];
				}

			}


			if (Object.values(this.value).length !== 0) {

				blob.value = this.value;

			}


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let alpha    = this.alpha;
			let entities = this.entities;
			let font     = this.font;
			let label    = this.__label;
			let position = this.position;
			let type     = this.type;
			let value    = this.value;


			let x1    = position.x + offsetX - this.width  / 2;
			let y1    = position.y + offsetY - this.height / 2;
			let x2    = position.x + offsetX + this.width  / 2;
			let y2    = position.y + offsetY + this.height / 2;
			let dim_x = 0;
			let dim_y = 0;
			let off_x = 0;
			let off_y = 0;



			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			if (type === Composite.TYPE.horizontal) {

				renderer.drawBox(
					x1,
					y1 + 64,
					x2,
					y2,
					'#363f3e',
					true
				);


				off_x = 0;
				off_y = 0;
				dim_x = this.width / label.length;
				dim_y = 64;

				for (let l = 0, ll = label.length; l < ll; l++) {


					renderer.drawBox(
						x1 + off_x + 2,
						y1 + off_y + 2,
						x1 + off_x + dim_x - 2,
						y1 + off_y + dim_y - 2,
						'#2f3736',
						true
					);

					renderer.drawText(
						x1 + off_x + dim_x / 2,
						y1 + off_y + dim_y / 2,
						label[l],
						font,
						true
					);

					off_x += dim_x;

				}

			} else if (type === Composite.TYPE.vertical) {

				renderer.drawBox(
					x1 + 128,
					y1,
					x2,
					y2,
					'#363f3e',
					true
				);


				off_x = 0;
				off_y = 0;
				dim_x = 128;
				dim_y = 0;

				for (let l = 0, ll = label.length; l < ll; l++) {

					dim_y = 0;

					for (let v = 0, vl = value.length; v < vl; v++) {
						dim_y = Math.max(dim_y, entities[v * ll + l].height + 32);
					}


					renderer.drawBox(
						x1 + off_x + 2,
						y1 + off_y + 2,
						x1 + off_x + dim_x - 2,
						y1 + off_y + dim_y - 2,
						'#2f3736',
						true
					);

					renderer.drawText(
						x1 + off_x + dim_x / 2,
						y1 + off_y + dim_y / 2,
						label[l],
						font,
						true
					);

					off_y += dim_y;

				}

			}

			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}


			_render_buffer.call(this, renderer);


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}

			if (this.__buffer !== null) {

				renderer.drawBuffer(
					x1,
					y1,
					this.__buffer
				);

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

				this.font = font;


				return true;

			}


			return false;

		},

		setModel: function(model) {

			model = model instanceof Object ? model : null;


			if (model !== null) {

				this.model   = {};
				this.__cache = [];

				for (let property in model) {

					let instance = model[property];
					if (instance !== null && typeof instance.setValue === 'function') {
						this.model[property] = lychee.serialize(model[property]);
					} else {
						this.model[property] = null;
					}

				}


				this.__label = Object.keys(this.model).map(label => label.toUpperCase());


				return true;

			}


			return false;

		},

		setType: function(type) {

			type = lychee.enumof(Composite.TYPE, type) ? type : null;


			if (type !== null) {

				this.type = type;
				this.trigger('relayout');


				return true;

			}


			return false;

		},

		setValue: function(value) {

			value = value instanceof Array ? value : null;


			if (value !== null) {

				let keys = Object.keys(this.model);
				let val  = value.filter(v => keys.join(',') === Object.keys(v).join(','));

				if (keys.length * val.length > this.__cache.length) {

					let cl = (keys.length * val.length - this.__cache.length) / keys.length;
					for (let c = 0; c < cl; c++) {

						for (let k = 0, kl = keys.length; k < kl; k++) {

							let key    = keys[k];
							let entity = lychee.deserialize(this.model[key]);
							if (entity === null) {
								entity = new lychee.app.entity.Label({
									value: '(Invalid APP Entity)'
								});
							} else if (typeof entity.bind === 'function') {
								entity.bind('#change', _on_change, this);
							}


							this.__cache.push(entity);

						}

					}

				}


				for (let v = 0, e = 0, vl = val.length; v < vl; v++) {

					let object = val[v];

					for (let property in object) {

						let entity = this.__cache[e];
						let value  = object[property];

						if (typeof value === 'string') {
							entity.setValue(value);
						} else if (value instanceof Object) {
							entity.setLabel(value.label);
							entity.setValue(value.value);
						}


						e++;

					}

				}


				this.entities = this.__cache.slice(0, keys.length * val.length);
				this.value    = val;
				this.trigger('relayout');


				return true;

			}


			return false;

		}

	};


	return Composite;

});

