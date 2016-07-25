
lychee.define('lychee.app.layer.Table').requires([
	'lychee.effect.Alpha',
	'lychee.app.entity.Label'
]).includes([
	'lychee.app.Layer'
]).exports(function(lychee, global, attachments) {

	var _FONT = attachments["fnt"];



	/*
	 * HELPERS
	 */

	var _on_change = function(entity) {

		var index = this.entities.indexOf(entity);
		if (index !== -1) {

			var label  = Object.keys(this.model);
			var object = {};

			for (var e = Math.floor(index / label.length) * label.length, el = e + label.length; e < el; e++) {

				var property = label[e % label.length];
				var value    = this.entities[e].value;

				object[property] = value;

			}


			if (Object.keys(object).length > 0) {
				this.trigger('change', [ entity, object ]);
			}

		}

	};

	var _on_relayout = function() {

		var entities = this.entities;
		var label    = this.__label;
		var type     = this.type;
		var value    = this.value;
		var x1       = -1/2 * this.width;
		var y1       = -1/2 * this.height;
		var dim_x    = 0;
		var dim_y    = 0;
		var off_x    = 0;
		var off_y    = 0;


		if (type === Composite.TYPE.horizontal) {

			off_x = 0;
			off_y = 64;
			dim_x = this.width / label.length;
			dim_y = 0;


			for (var v = 0, vl = value.length; v < vl; v++) {

				dim_y = 0;

				for (var l = 0, ll = label.length; l < ll; l++) {
					dim_y = Math.max(dim_y, entities[v * ll + l].height + 32);
				}


				for (var l = 0, ll = label.length; l < ll; l++) {

					var entity = entities[v * ll + l];


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


			for (var l = 0, ll = label.length; l < ll; l++) {

				dim_y = 0;

				for (var v = 0, vl = value.length; v < vl; v++) {
					dim_y = Math.max(dim_y, entities[v * ll + l].height + 32);
				}


				for (var v = 0, vl = value.length; v < vl; v++) {

					var entity = entities[v * ll + l];


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

	var _render_buffer = function(renderer) {

		if (this.__buffer !== null) {
			this.__buffer.resize(this.width, this.height);
		} else {
			this.__buffer = renderer.createBuffer(this.width, this.height);
		}


		renderer.clear(this.__buffer);
		renderer.setBuffer(this.__buffer);
		renderer.setAlpha(1.0);


		var entities = this.entities;
		var offset   = this.offset;
		var el       = entities.length;
		if (el > 0) {

			var ox = this.width  / 2 + offset.x;
			var oy = this.height / 2 + offset.y;

			for (var e = 0; e < el; e++) {

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

	var Composite = function(data) {

		var settings = Object.assign({}, data);


		this.font  = _FONT;
		this.model = {};
		this.type  = Composite.TYPE.horizontal;
		this.value = [];

		this.__cache  = [];
		this.__buffer = null;
		this.__label  = [];


		this.setFont(settings.font);
		this.setModel(settings.model);
		this.setType(settings.type);
		this.setValue(settings.value);


		if (this.type === Composite.TYPE.horizontal) {
			settings.width  = typeof settings.width === 'number'  ? settings.width  : 512;
			settings.height = typeof settings.height === 'number' ? settings.height : 384;
		} else if (this.type === Composite.TYPE.vertical) {
			settings.width  = typeof settings.width === 'number'  ? settings.width  : 384;
			settings.height = typeof settings.height === 'number' ? settings.height : 512;
		}

		settings.shape    = lychee.app.Entity.SHAPE.rectangle;
		settings.relayout = false;


		lychee.app.Layer.call(this, settings);



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

			var font = lychee.deserialize(blob.font);
			if (font !== null) {
				this.setFont(font);
			}


			if (blob.model instanceof Object) {

				var model = {};

				for (var property in blob.model) {
					model[property] = lychee.deserialize(blob.model[property]);
				}

				this.setModel(model);

			}


			if (blob.value instanceof Array) {
				this.setValue(blob.value);
			}

		},

		serialize: function() {

			var data = lychee.app.Layer.prototype.serialize.call(this);
			data['constructor'] = 'lychee.app.layer.Table';

			var settings = data['arguments'][0];
			var blob     = (data['blob'] || {});


			if (this.type !== Composite.TYPE.horizontal) settings.type = this.type;


			if (this.font !== null) blob.font = lychee.serialize(this.font);


			if (Object.keys(this.model).length !== 0) {

				blob.model = {};

				for (var property in this.model) {
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


			var alpha    = this.alpha;
			var entities = this.entities;
			var font     = this.font;
			var label    = this.__label;
			var model    = this.model;
			var position = this.position;
			var type     = this.type;
			var value    = this.value;


			var x1    = position.x + offsetX - this.width  / 2;
			var y1    = position.y + offsetY - this.height / 2;
			var x2    = position.x + offsetX + this.width  / 2;
			var y2    = position.y + offsetY + this.height / 2;
			var dim_x = 0;
			var dim_y = 0;
			var off_x = 0;
			var off_y = 0;



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

				for (var l = 0, ll = label.length; l < ll; l++) {


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

				for (var l = 0, ll = label.length; l < ll; l++) {

					dim_y = 0;

					for (var v = 0, vl = value.length; v < vl; v++) {
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

				for (var property in model) {

					var instance = model[property];
					if (instance !== null && typeof instance.setValue === 'function') {
						this.model[property] = lychee.serialize(model[property]);
					} else {
						this.model[property] = null;
					}

				}


				this.__label = Object.keys(this.model).map(function(label) {
					return label.toUpperCase();
				});


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

				var keys = Object.keys(this.model);
				var val  = value.filter(function(v) {
					return keys.join(',') === Object.keys(v).join(',');
				});


				if (keys.length * val.length > this.__cache.length) {

					var cl = (keys.length * val.length - this.__cache.length) / keys.length;
					for (var c = 0; c < cl; c++) {

						for (var k = 0, kl = keys.length; k < kl; k++) {

							var key    = keys[k];
							var entity = lychee.deserialize(this.model[key]);
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


				for (var v = 0, e = 0, vl = val.length; v < vl; v++) {

					var object = val[v];

					for (var property in object) {

						var entity = this.__cache[e];
						var value  = object[property];

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

