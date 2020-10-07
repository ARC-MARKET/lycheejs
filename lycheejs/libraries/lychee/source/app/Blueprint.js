
lychee.define('lychee.app.Blueprint').requires([
	'lychee.effect.Position',
	'lychee.app.Element'
]).includes([
	'lychee.app.Layer'
]).exports((lychee, global, attachments) => {

	const _Element  = lychee.import('lychee.app.Element');
	const _Layer    = lychee.import('lychee.app.Layer');
	const _Position = lychee.import('lychee.effect.Position');



	/*
	 * HELPERS
	 */

	const _validate_entity = function(entity) {

		if (entity instanceof Object) {

			if (
				typeof entity.update === 'function'
				&& typeof entity.render === 'function'
				&& typeof entity.shape === 'number'
				&& typeof entity.setOrder === 'function'
			) {
				return true;
			}

		}


		return false;

	};

	const _on_relayout = function() {

		let fade    = this.__fade;
		let visible = this.visible;

		if (visible === true) {

			let entity = null;
			let type   = this.type;
			let x1     = -1 / 2 * this.width;
			let x2     =  1 / 2 * this.width;
			let y1     = -1 / 2 * this.height;
			let off_x  = x1 + 32;
			let off_y  = y1 + 32;
			let pos_x  = 0;
			let pos_y  = 0;


			if (type === Composite.TYPE.grid) {

				for (let e = 0, el = this.entities.length; e < el; e++) {

					entity = this.entities[e];
					pos_x  = off_x + entity.width  / 2;
					pos_y  = off_y + entity.height / 2;

					if (pos_x + entity.width / 2 > x2 - 32) {

						off_x  = x1 + 32;
						off_y += entity.height + 32;

						pos_x = off_x + entity.width  / 2;
						pos_y = off_y + entity.height / 2;

						off_x += entity.width + 32;

					} else {

						pos_x = off_x + entity.width  / 2;
						pos_y = off_y + entity.height / 2;

						off_x += entity.width + 32;

					}


					entity.trigger('relayout');
					entity.setOrder(e + 1);


					if (fade === true) {

						entity.setPosition({
							x: pos_x,
							y: pos_y - 3 / 2 * this.height
						});

						entity.addEffect(new _Position({
							type:     _Position.TYPE.easeout,
							delay:    100 * e,
							duration: 300,
							position: {
								x: pos_x,
								y: pos_y
							}
						}));

					} else {

						entity.setPosition({
							x: pos_x,
							y: pos_y
						});

					}

				}

			} else if (type === Composite.TYPE.view) {

				if (this.entities.length === 2) {

					entity        = this.entities[0];
					entity.width  = 320;
					entity.height = this.height;

					pos_x = x1 + 32 + entity.width / 2;
					pos_y = y1 + entity.height / 2;

					entity.trigger('relayout');
					entity.setOrder(1);


					if (fade === true) {

						entity.setPosition({
							x: pos_x,
							y: pos_y - 3 / 2 * this.height
						});

						entity.addEffect(new _Position({
							type:     _Position.TYPE.easeout,
							delay:    100,
							duration: 300,
							position: {
								x: pos_x,
								y: pos_y
							}
						}));

					} else {

						entity.setPosition({
							x: pos_x,
							y: pos_y
						});

					}


					entity        = this.entities[1];
					entity.width  = Math.max(480, this.width - 64 - 320);
					entity.height = this.height;

					pos_x = x1 + 320 + 64 + entity.width / 2;
					pos_y = y1 + entity.height / 2;

					entity.trigger('relayout');
					entity.setOrder(2);


					if (fade === true) {

						entity.setPosition({
							x: pos_x,
							y: pos_y - 3 / 2 * this.height
						});

						entity.addEffect(new _Position({
							type:     _Position.TYPE.easeout,
							delay:    100,
							duration: 300,
							position: {
								x: pos_x,
								y: pos_y
							}
						}));

					} else {

						entity.setPosition({
							x: pos_x,
							y: pos_y
						});

					}

				}

			} else if (type === Composite.TYPE.full) {

				for (let e = 0, el = this.entities.length; e < el; e++) {

					let entity = this.entities[e];

					entity.position.x = 0;
					entity.position.y = 0;

				}

			}

		}


		if (fade === true) {
			this.__fade = false;
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.type = Composite.TYPE.grid;


		this.__fade = false;


		this.setType(states.type);

		delete states.type;


		states.relayout = false;


		_Layer.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('relayout', _on_relayout, this);
		this.bind('reshape',  _on_relayout, this);

	};


	Composite.TYPE = {
		grid: 0,
		view: 1,
		full: 2
	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'lychee.app.Blueprint';

			let states = data['arguments'][0];
			let blob   = (data['blob'] || {});


			if (this.type !== Composite.TYPE.grid) states.type = this.type;


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		addEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {

				let index = this.entities.indexOf(entity);
				if (index === -1) {

					this.entities.push(entity);
					this.trigger('relayout');

					return true;

				}

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

		setVisible: function(visible) {

			visible = typeof visible === 'boolean' ? visible : null;


			if (visible !== null) {

				let fade = false;
				if (this.visible === false && visible === true) {
					fade = true;
				}


				this.visible = visible;


				if (fade === true) {
					this.__fade = true;
					this.trigger('relayout');
				}


				return true;

			}


			return false;

		}

	};


	return Composite;

});

