
lychee.define('lychee.app.Element').requires([
	'lychee.app.entity.Label',
	'lychee.app.entity.Text'
]).includes([
	'lychee.app.Layer'
]).exports((lychee, global, attachments) => {

	const _Label = lychee.import('lychee.app.entity.Label');
	const _Layer = lychee.import('lychee.app.Layer');
	const _Text  = lychee.import('lychee.app.entity.Text');
	const _FONTS = {
		label: attachments['label.fnt'],
		order: attachments['order.fnt']
	};



	/*
	 * HELPERS
	 */

	const _validate_entity = function(entity) {

		if (entity instanceof Object) {

			if (
				typeof entity.update === 'function'
				&& typeof entity.render === 'function'
				&& typeof entity.shape === 'number'
			) {
				return true;
			}

		}


		return false;

	};

	const _on_relayout = function() {

		let content = this.__content;
		let entity  = null;
		let label   = null;
		let layout  = [
			this.getEntity('@order'),
			this.getEntity('@label')
		];


		let x1 = -1 / 2 * this.width;
		let y1 = -1 / 2 * this.height;


		if (content.length % 2 === 0) {

			let offset   = 64 + 16;
			let boundary = 0;

			for (let c = 0, cl = content.length; c < cl; c += 2) {

				entity   = content[c]     || null;
				label    = content[c + 1] || null;
				boundary = 0;


				if (entity.visible === true) {

					if (label !== null) {

						label.position.x  = x1 + 16 + label.width / 2;
						label.position.y  = y1 + offset + label.height / 2;
						label.visible     = true;

						entity.width      = 1 / 2 * (this.width - 32);
						entity.position.x = 1 / 4 * (this.width - 32);
						entity.position.y = y1 + offset + entity.height / 2;
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


		let order_w = 0;


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

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.label     = 'CONTENT';
		this.options   = [];
		this.order     = 1;

		this.__content = [];


		states.width    = typeof states.width === 'number'  ? states.width  : 256;
		states.height   = typeof states.height === 'number' ? states.height : 384;
		states.relayout = false;


		_Layer.call(this, states);



		/*
		 * INITIALIZATION
		 */

		_Layer.prototype.setEntity.call(this, '@order', new _Label({
			font:  _FONTS.order,
			value: '' + this.order
		}));

		_Layer.prototype.setEntity.call(this, '@label', new _Label({
			font:  _FONTS.label,
			value: this.label
		}));


		this.__content = [];
		this.unbind('relayout');
		this.bind('relayout', _on_relayout, this);


		this.setLabel(states.label);
		this.setOrder(states.order);

		states = null;

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
			data['constructor'] = 'lychee.app.Element';

			let states = data['arguments'][0];
			let blob   = (data['blob'] || {});


			if (this.label !== 'CONTENT') states.label = this.label;
			if (this.order !== 1)         states.order = this.order;


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

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {

				let result = _Layer.prototype.addEntity.call(this, entity);
				if (result === true) {

					this.__content.push(entity);
					this.__content.push(null);

					return true;

				}

			}


			return false;

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

						if (entity.confines(position) === true) {
							found = entity;
							break;
						}

					}

				}

			}


			return found;

		},

		setEntity: function(id, entity) {

			id     = typeof id === 'string'            ? id     : null;
			entity = _validate_entity(entity) === true ? entity : null;


			if (id !== null && entity !== null) {

				let result = _Layer.prototype.setEntity.call(this, id, entity);
				if (result === true) {

					let label = new lychee.app.entity.Label({
						value: id.charAt(0).toUpperCase() + id.substr(1)
					});

					this.entities.push(label);

					let index = this.__content.length - 1;
					if (this.__content[index] === null) {
						this.__content[index] = label;
					}

					return true;

				}

			}


			return false;

		},

		removeEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {

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

					return true;

				}

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

				// XXX: Implemented by inheriting Composites

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

