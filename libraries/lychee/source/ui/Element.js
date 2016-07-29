
lychee.define('lychee.ui.Element').requires([
	'lychee.ui.entity.Button',
	'lychee.ui.entity.Label',
	'lychee.ui.entity.Text'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, global, attachments) {

	const _Button = lychee.import('lychee.ui.entity.Button');
	const _Label  = lychee.import('lychee.ui.entity.Label');
	const _Layer  = lychee.import('lychee.ui.Layer');
	const _FONTS  = {
		label: attachments["label.fnt"],
		order: attachments["order.fnt"]
	};



	/*
	 * HELPERS
	 */

	const _on_relayout = function() {

		let content = this.__content;
		let entity  = null;
		let label   = null;
		let layout  = [
			this.getEntity('@order'),
			this.getEntity('@label'),
			this.getEntity('@options-prev'),
			this.getEntity('@options-next')
		];


		let x1 = -1/2 * this.width;
		let x2 =  1/2 * this.width;
		let y1 = -1/2 * this.height;
		let y2 =  1/2 * this.height;


		if (content.length % 2 === 0) {

			let offset   = 64 + 16;
			let boundary = 0;

			for (let c = 0, cl = content.length; c < cl; c += 2) {

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


		let entities = this.entities;
		let index    = -1;
		let order_w  = 0;


		entity            = layout[0];
		order_w           = entity.width;
		entity.position.x = x1 + 16 + order_w / 2;
		entity.position.y = y1 + 32 - 1;

		entity            = layout[1];
		entity.width      = this.width - 48 - order_w;
		entity.position.x = x1 + 32 + order_w + entity.width / 2;
		entity.position.y = y1 + 32;

		entity            = layout[2];
		entity.width      = 96;
		entity.position.x = x1 + 16 + entity.width / 2;
		entity.position.y = y2 - 32;

		index = entities.indexOf(entity);
		if (index !== -1) {
			entities.splice(index, 1);
			entities.push(entity);
		}

		entity = layout[3];
		entity.width      = 96;
		entity.position.x = x2 - 16 - entity.width / 2;
		entity.position.y = y2 - 32;

		index = entities.indexOf(entity);
		if (index !== -1) {
			entities.splice(index, 1);
			entities.push(entity);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.label     = 'CONTENT';
		this.options   = [ 'Okay', 'Cancel' ];
		this.order     = 1;

		this.__content = [];


		settings.width    = typeof settings.width === 'number'  ? settings.width  : 256;
		settings.height   = typeof settings.height === 'number' ? settings.height : 384;
		settings.relayout = false;


		_Layer.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		let content = this.__content.slice(0);

		_Layer.prototype.setEntity.call(this, '@order', new _Label({
			font:  _FONTS.order,
			value: '' + this.order
		}));

		_Layer.prototype.setEntity.call(this, '@label', new _Label({
			font:  _FONTS.label,
			value: this.label
		}));

		_Layer.prototype.setEntity.call(this, '@options-prev', new _Button({
			label: this.options[1],
			value: this.options[1].toLowerCase()
		}));

		_Layer.prototype.setEntity.call(this, '@options-next', new _Button({
			label: this.options[0],
			value: this.options[0].toLowerCase()
		}));


		this.__content = content;
		this.unbind('relayout');
		this.bind('relayout', _on_relayout, this);


		this.getEntity('@options-prev').bind('change', function(value) {
			this.trigger('change', [ value ]);
		}, this);

		this.getEntity('@options-next').bind('change', function(value) {
			this.trigger('change', [ value ]);
		}, this);


		this.setLabel(settings.label);
		this.setOptions(settings.options);
		this.setOrder(settings.order);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			_Layer.prototype.deserialize.call(this, blob);

			this.trigger('relayout');

		},

		serialize: function() {

			let data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.Element';

			let settings = data['arguments'][0];
			let blob     = (data['blob'] || {});


			if (this.label !== 'CONTENT')                 settings.label   = this.label;
			if (this.options.join(',') !== 'Okay,Cancel') settings.options = this.options.slice(0, this.options.length);
			if (this.order !== 1)                         settings.order   = this.order;


			if (this.__content.length > 0) {

				let entities = this.__content.filter(function(value, index) {
					return index % 2 === 0;
				});

				let map = Object.map(this.__map, function(val, key) {

					let index = entities.indexOf(val);
					if (index !== -1) {
						return index;
					}


					return undefined;

				}, this);


				blob.entities = entities.map(lychee.serialize);
				blob.map      = map;

			} else {

				delete blob.entities;
				delete blob.map;

			}


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


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
				_Layer.prototype.render.call(this, renderer, offsetX, offsetY);
			}

			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}

		},



		/*
		 * CUSTOM API
		 */

		addEntity: function(entity) {

			let result = _Layer.prototype.addEntity.call(this, entity);
			if (result === true) {
				this.__content.push(entity);
				this.__content.push(null);
			}

			return result;

		},

		getEntity: function(id, position) {

			id        = typeof id === 'string'    ? id       : null;
			position = position instanceof Object ? position : null;


			let found = null;


			if (id !== null) {

				let num = parseInt(id, 10);

				if (this.__map[id] !== undefined) {
					found = this.__map[id];
				} else if (isNaN(num) === false) {
					found = this.__content[num] || null;
				}

			} else if (position !== null) {

				if (typeof position.x === 'number' && typeof position.y === 'number') {

					for (let e = this.entities.length - 1; e >= 0; e--) {

						let entity = this.entities[e];
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

			let result = _Layer.prototype.setEntity.call(this, id, entity);
			if (result === true) {

				let label = new _Label({
					value: id.charAt(0).toUpperCase() + id.substr(1)
				});


				this.entities.push(label);


				let index = this.__content.length - 1;
				if (this.__content[index] === null) {
					this.__content[index] = label;
				}

			}

			return result;

		},

		removeEntity: function(entity) {

			let result = _Layer.prototype.removeEntity.call(this, entity);
			if (result === true) {

				let index = this.__content.indexOf(entity);
				if (index !== -1) {

					let label = this.__content[index + 1];
					let tmp   = this.entities.indexOf(label);
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

		setOptions: function(options) {

			options = options instanceof Array ? options : null;


			if (options !== null) {

				this.options = options.map(function(val) {
					return '' + val;
				});


				let next = this.getEntity('@options-next');
				let prev = this.getEntity('@options-prev');

				if (this.options.length === 0) {

					next.visible = false;
					prev.visible = false;

				} else if (this.options.length === 1) {

					next.visible = true;
					next.setLabel(this.options[0]);
					next.setValue(this.options[0].toLowerCase());

					prev.visible = false;

				} else if (this.options.length === 2) {

					next.visible = true;
					next.setLabel(this.options[0]);
					next.setValue(this.options[0].toLowerCase());

					prev.visible = true;
					prev.setLabel(this.options[1]);
					prev.setValue(this.options[1].toLowerCase());


				}


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

