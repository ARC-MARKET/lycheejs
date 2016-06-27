
lychee.define('lychee.ui.Blueprint').requires([
	'lychee.effect.Offset',
	'lychee.effect.Position',
	'lychee.ui.Element'
]).includes([
	'lychee.ui.Layer'
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


			this.__scroll.max_x = 0;
			this.__scroll.min_y = 0;
			this.__scroll.delta = 0;


			if (type === Class.TYPE.grid) {

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


					this.__scroll.min_y = Math.min(this.__scroll.min_y, -1 * (y1 + pos_y + entity.height / 2 + 32));
					this.__scroll.delta = Math.max(this.__scroll.delta, entity.height + 32);

				}

			} else if (type === Class.TYPE.view) {

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


					this.__scroll.max_x = Math.min(this.__scroll.max_x, -1 * (x1 + pos_x + entity.width / 2 + 32));

				} else if (this.entities.length === 1) {

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

				}

			} else if (type === Class.TYPE.full) {

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

	var _on_tab = function(name) {

		if (this.__focus.element === null) {
			this.__focus.element = this.entities[0] || null;
		}


		var focus = this.__focus;
		if (focus.element !== null) {

			var entities  = focus.element.entities;
			var triggered = null;


			if (name === 'tab') {

				var e = focus.entity !== null ? entities.indexOf(focus.entity) : 0;

				for (var el = entities.length; e < el; e++) {

					var entity = entities[e];
					if (entity === focus.entity) {

						entity.trigger('blur');

					} else if (entity.visible === true) {

						var result = entity.trigger('focus');
						if (result === true && entity.state === 'active') {
							triggered = entity;
							break;
						}

					}

				}


				if (triggered === null) {

					var index = this.entities.indexOf(focus.element);
					if (index !== -1) {

						focus.element = this.entities[index + 1] || null;
						focus.entity  = null;

					}

				}

			} else if (name === 'shift-tab') {

				var e = focus.entity !== null ? entities.indexOf(focus.entity) : entities.length - 1;

				for (var el = entities.length; e >= 0; e--) {

					var entity = entities[e];
					if (entity === focus.entity) {

						entity.trigger('blur');

					} else if (entity.visible === true) {

						var result = entity.trigger('focus');
						if (result === true && entity.state === 'active') {
							triggered = entity;
							break;
						}

					}

				}


				if (triggered === null) {

					var index = this.entities.indexOf(focus.element);
					if (index !== -1) {

						focus.element = this.entities[index - 1] || null;
						focus.entity  = null;

					}

				}

			}



			if (triggered !== null) {
				focus.entity = triggered;
			} else if (focus.element !== null) {
				_on_tab.call(this, name);
			}

		}

	};

	var _on_touch = function(id, position, delta) {

		if (this.visible === false) return null;


		var triggered = null;
		var args      = [ id, {
			x: position.x - this.offset.x,
			y: position.y - this.offset.y
		}, delta ];


		var entity = this.getEntity(null, args[1]);
		if (entity !== null) {

			if (typeof entity.trigger === 'function') {

				args[1].x -= entity.position.x;
				args[1].y -= entity.position.y;

				var result = entity.trigger('touch', args);
				if (result === true) {
					triggered = entity;
				} else if (result !== false) {
					triggered = result;
				}

			}

		} else {

			triggered = this;

		}


		return triggered;

	};

	var _on_swipe = function(id, state, position, delta, swipe) {

		if (this.effects.length === 0) {

			var scroll = this.__scroll;
			var type   = this.type;


			if (type === Class.TYPE.grid) {

				if (state === 'start') {

					scroll.start = this.offset.y;

				} else if (state === 'move' || state === 'end') {

					if (scroll.start === null) {
						scroll.start = this.offset.x;
					}


					if (Math.abs(swipe.y) >= 128) {

						var offset_y = scroll.start;

						if (swipe.y > 0) {
							offset_y += scroll.delta;
						} else if (swipe.y < 0) {
							offset_y -= scroll.delta;
						}


						if (offset_y < scroll.min_y) {
							offset_y = scroll.min_y;
						} else if (offset_y > 0) {
							offset_y = 0;
						}


						this.addEffect(new lychee.effect.Offset({
							type:     lychee.effect.Offset.TYPE.easeout,
							duration: 300,
							offset:   {
								y: offset_y
							}
						}));


						return false;

					}

				}

			} else if (type === Class.TYPE.view) {

				if (state === 'start') {

					scroll.start = this.offset.x;

				} else if (state === 'move' || state === 'end') {

					if (scroll.start === null) {
						scroll.start = this.offset.x;
					}


					if (Math.abs(swipe.x) >= 128) {

						var offset_x = scroll.start;

						if (swipe.x > 0) {
							offset_x += scroll.delta;
						} else if (swipe.x < 0) {
							offset_x -= scroll.delta;
						}


						if (offset_x > scroll.max_x) {
							offset_x = scroll.max_x;
						} else if (offset_x < 0) {
							offset_x = 0;
						}


						this.addEffect(new lychee.effect.Offset({
							type:     lychee.effect.Offset.TYPE.easeout,
							duration: 300,
							offset:   {
								x: offset_x
							}
						}));


						return false;

					}

				}

			}

		}


		return true;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.type = Class.TYPE.grid;


		this.__fade   = false;
		this.__focus  = {
			element: null,
			entity:  null
		};
		this.__scroll = {
			start: 0,
			delta: 0,
			max_x: 0,
			min_y: 0
		};


		this.setType(settings.type);

		delete settings.type;


		settings.relayout = false;


		lychee.ui.Layer.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.unbind('touch');

		this.bind('relayout', _on_relayout, this);
		this.bind('reshape',  _on_relayout, this);
		this.bind('touch',    _on_touch,    this);
		this.bind('swipe',    _on_swipe,    this);

		this.bind('key', function(key, name, delta) {

			var focus = this.__focus;


			if (key === 'tab') {

				_on_tab.call(this, name);


				return true;

			} else if (key === 'page-up') {

				_on_swipe.call(this, null, 'start');
				_on_swipe.call(this, null, 'move', null, null, {
					y: 128
				});


				return true;

			} else if (key === 'page-down') {

				_on_swipe.call(this, null, 'start');
				_on_swipe.call(this, null, 'move', null, null, {
					y: -128
				});


				return true;

			} else if (focus.element !== null) {

				var entity = focus.entity;
				if (entity !== null) {
					entity.trigger('key', [ key, name, delta ]);
				}


				return true;

			}


			return false;

		}, this);

	};


	Class.TYPE = {
		grid: 0,
		view: 1,
		full: 2
	};


	Class.prototype = {

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

			type = lychee.enumof(Class.TYPE, type) ? type : null;


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


	return Class;

});

