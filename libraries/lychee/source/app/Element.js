
lychee.define('lychee.app.Element').requires([
	'lychee.app.entity.Label',
	'lychee.app.entity.Text'
]).includes([
	'lychee.app.Layer'
]).exports(function(lychee, global, attachments) {

	var _FONTS = {
		label: attachments["label.fnt"],
		order: attachments["order.fnt"]
	};



	/*
	 * HELPERS
	 */

	var _on_relayout = function() {

		var content = this.__content;
		var entity  = null;
		var label   = null;
		var layout  = [
			this.getEntity('@order'),
			this.getEntity('@label')
		];


		var x1 = -1/2 * this.width;
		var x2 =  1/2 * this.width;
		var y1 = -1/2 * this.height;
		var y2 =  1/2 * this.height;


		if (content.length % 2 === 0) {

			var offset   = 64 + 16;
			var boundary = 0;

			for (var c = 0, cl = content.length; c < cl; c += 2) {

				entity   = content[c]     || null;
				label    = content[c + 1] || null;
				boundary = 0;


				if (entity.visible === true) {

					if (label !== null) {

						label.position.x  =   x1 + 16 + label.width / 2;
						label.position.y  =   y1 + offset + label.height / 2;
						label.visible     = true;

						entity.width      =  1/2 * (this.width - 32);
						entity.position.x =  1/4 * (this.width - 32);
						entity.position.y =   y1 + offset + entity.height / 2;
						entity.visible    = true;
						entity.trigger('relayout');

						boundary = Math.max(label.height, entity.height);
						label.position.y  = y1 + offset + boundary / 2;
						entity.position.y = y1 + offset + boundary / 2;

						offset += boundary + 16;

					} else {

						entity.width      = this.width - 32;
						entity.position.x = 0;
						entity.position.y = y1 + offset + entity.height / 2;
						entity.visible    = true;
						entity.trigger('relayout');

						boundary = entity.height;
						entity.position.y = y1 + offset + boundary / 2;

						offset += boundary + 16;

					}

				} else {

					if (label !== null) {
						label.visible = false;
					}

				}

			}

		}


		var entities = this.entities;
		var index    = -1;
		var order_w  = 0;


		entity            = layout[0];
		order_w           = entity.width;
		entity.position.x = x1 + 16 + order_w / 2;
		entity.position.y = y1 + 32 - 1;

		entity            = layout[1];
		entity.position.x = x1 + 32 + order_w + entity.width / 2;
		entity.position.y = y1 + 32;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({}, data);


		this.label = 'CONTENT';
		this.order = 1;

		this.__content = [];


		settings.width    = typeof settings.width === 'number'  ? settings.width  : 256;
		settings.height   = typeof settings.height === 'number' ? settings.height : 384;
		settings.relayout = false;


		lychee.app.Layer.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		lychee.app.Layer.prototype.setEntity.call(this, '@order', new lychee.app.entity.Label({
			font:  _FONTS.order,
			value: '' + this.order
		}));

		lychee.app.Layer.prototype.setEntity.call(this, '@label', new lychee.app.entity.Label({
			font:  _FONTS.label,
			value: this.label
		}));


		this.__content = [];
		this.unbind('relayout');
		this.bind('relayout', _on_relayout, this);


		this.setLabel(settings.label);
		this.setOrder(settings.order);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			lychee.app.Layer.prototype.deserialize.call(this, blob);

			this.trigger('relayout');

		},

		serialize: function() {

			var data = lychee.app.Layer.prototype.serialize.call(this);
			data['constructor'] = 'lychee.app.Element';

			var settings = data['arguments'][0];
			var blob     = (data['blob'] || {});


			if (this.label !== 'CONTENT') settings.label = this.label;
			if (this.order !== 1)         settings.order = this.order;


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


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

			renderer.drawBox(
				x - hwidth,
				y - hheight,
				x + hwidth,
				y - hheight + 64,
				'#2f3736',
				true
			);

			renderer.drawBox(
				x - hwidth,
				y - hheight + 64,
				x + hwidth,
				y + hheight,
				'#363f3e',
				true
			);

			if (alpha !== 0) {
				lychee.app.Layer.prototype.render.call(this, renderer, offsetX, offsetY);
			}

			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}

		},



		/*
		 * CUSTOM API
		 */

		addEntity: function(entity) {

			var result = lychee.app.Layer.prototype.addEntity.call(this, entity);
			if (result === true) {
				this.__content.push(entity);
				this.__content.push(null);
			}

			return result;

		},

		getEntity: function(id, position) {

			id        = typeof id === 'string'    ? id       : null;
			position = position instanceof Object ? position : null;


			var found = null;


			if (id !== null) {

				var num = parseInt(id, 10);

				if (this.__map[id] !== undefined) {
					found = this.__map[id];
				} else if (isNaN(num) === false) {
					found = this.__content[num] || null;
				}

			} else if (position !== null) {

				if (typeof position.x === 'number' && typeof position.y === 'number') {

					for (var e = this.entities.length - 1; e >= 0; e--) {

						var entity = this.entities[e];
						if (entity.visible === false) continue;

						if (entity.isAtPosition(position) === true) {
							found = entity;
							break;
						}

					}

				}

			}


			return found;

		},

		setEntity: function(id, entity) {

			var result = lychee.app.Layer.prototype.setEntity.call(this, id, entity);
			if (result === true) {

				var label = new lychee.app.entity.Label({
					value: id.charAt(0).toUpperCase() + id.substr(1)
				});


				this.entities.push(label);


				var index = this.__content.length - 1;
				if (this.__content[index] === null) {
					this.__content[index] = label;
				}

			}

			return result;

		},

		removeEntity: function(entity) {

			var result = lychee.app.Layer.prototype.removeEntity.call(this, entity);
			if (result === true) {

				var index = this.__content.indexOf(entity);
				if (index !== -1) {

					var label = this.__content[index + 1];
					var tmp   = this.entities.indexOf(label);
					if (tmp !== -1) {
						this.entities.splice(tmp, 1);
					}


					this.__content.splice(index, 2);

				}

			}

			return result;

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

		setOrder: function(order) {

			order = typeof order === 'number' ? (order | 0) : null;


			if (order !== null) {

				this.getEntity('@order').setValue('' + order);
				this.order = order;


				return true;

			}


			return false;

		}

	};


	return Composite;

});

