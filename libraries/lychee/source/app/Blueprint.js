
lychee.define('lychee.app.Blueprint').requires([
	'lychee.effect.Offset',
	'lychee.effect.Position',
	'lychee.app.Element'
]).includes([
	'lychee.app.Layer'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _validate_entity = function(entity) {

		if (entity instanceof Object) {

			if (typeof entity.update === 'function' && typeof entity.render === 'function' && typeof entity.shape === 'number') {

				if (typeof entity.setOrder === 'function' && typeof entity.isAtPosition === 'function') {
					return true;
				}

			}

		}


		return false;

	};

	var _on_relayout = function() {

		var fade    = this.__fade;
		var visible = this.visible;

		if (visible === true) {

			var entity = null;
			var type   = this.type;
			var x1     = -1/2 * this.width;
			var x2     =  1/2 * this.width;
			var y1     = -1/2 * this.height;
			var y2     =  1/2 * this.height;
			var off_x  = x1 + 32;
			var off_y  = y1 + 32;
			var pos_x  = 0;
			var pos_y  = 0;


			if (type === Composite.TYPE.grid) {

				for (var e = 0, el = this.entities.length; e < el; e++) {

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
							y: pos_y - 3/2 * this.height
						});

						entity.addEffect(new lychee.effect.Position({
							type:     lychee.effect.Position.TYPE.easeout,
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
							y: pos_y - 3/2 * this.height
						});

						entity.addEffect(new lychee.effect.Position({
							type:     lychee.effect.Position.TYPE.easeout,
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
							y: pos_y - 3/2 * this.height
						});

						entity.addEffect(new lychee.effect.Position({
							type:     lychee.effect.Position.TYPE.easeout,
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

				for (var e = 0, el = this.entities.length; e < el; e++) {

					var entity = this.entities[e];

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

	var Composite = function(data) {

		var settings = Object.assign({}, data);


		this.type = Composite.TYPE.grid;


		this.__fade = false;


		this.setType(settings.type);

		delete settings.type;


		settings.relayout = false;


		lychee.app.Layer.call(this, settings);



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
		 * CUSTOM API
		 */

		addEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {

				var index = this.entities.indexOf(entity);
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

			if (visible === true || visible === false) {

				var fade = false;
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

