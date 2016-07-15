
lychee.define('lychee.app.State').requires([
	'lychee.app.Layer',
	'lychee.ui.Layer'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _get_id = function(entity) {

		for (var id in this.__map) {

			if (this.__map[id] === entity) {
				return id;
			}

		}


		return null;

	};

	var _recursive_deserialize = function(oldlayer, newlayer) {

		if (typeof oldlayer.setType === 'function') {
			oldlayer.setType(newlayer.type);
		}

		if (typeof oldlayer.setVisible === 'function') {
			oldlayer.setVisible(newlayer.visible);
		}


		for (var e = 0, el = newlayer.entities.length; e < el; e++) {

			var entity = newlayer.entities[e];
			var id     = _get_id.call(newlayer, entity);
			var other  = oldlayer.getEntity(id);

			if (other === null) {

				oldlayer.setEntity(id, entity);

			} else if (typeof other.entities !== 'undefined' && typeof entity.entities !== 'undefined') {

				_recursive_deserialize(other, entity);

			}

		}

	};

	var _on_key = function(key, name, delta) {

		var focus = this.__focus;
		if (focus !== null) {

			var result = focus.trigger('key', [ key, name, delta ]);
			if (result === true) {

				if (focus.state === 'default') {
					this.__focus = null;
				}

			}

		}

	};

	var _on_reshape = function(orientation, rotation, width, height) {

		var renderer = this.renderer;
		if (renderer !== null) {

			var position = {
				x: 1/2 * renderer.width,
				y: 1/2 * renderer.height
			};


			for (var id in this.__layers) {
				this.__layers[id].setPosition(position);
				this.__layers[id].trigger('relayout');
			}

		}

	};

	var _on_scroll = function(id, direction, position, delta) {

		var args = [ id, direction, {
			x: 0,
			y: 0
		}, delta ];


		var x = position.x;
		var y = position.y;


		var renderer = this.renderer;
		if (renderer !== null) {

			x -= renderer.offset.x;
			y -= renderer.offset.y;

		}


		for (var lid in this.__layers) {

			var layer = this.__layers[lid];
			if (layer.visible === false) continue;

			if (lychee.interfaceof(lychee.ui.Layer, layer)) {

				args[2].x = x - layer.position.x;
				args[2].y = y - layer.position.y;


				var result = layer.trigger('scroll', args);
				if (result !== true && result !== false && result !== null) {
					break;
				}

			}

		}

	};

	var _on_swipe = function(id, type, position, delta, swipe) {

		var touch = this.__touches[id];
		if (touch.entity !== null) {

			if (touch.layer.visible === false) return;


			var args   = [ id, type, position, delta, swipe ];
			var result = false;

			var renderer = this.renderer;
			if (renderer !== null) {

				args[2].x -= renderer.offset.x;
				args[2].y -= renderer.offset.y;

			}


			if (type === 'start') {

				_trace_entity_offset.call(
					touch.offset,
					touch.entity,
					touch.layer
				);


				args[2].x -= touch.offset.x;
				args[2].y -= touch.offset.y;
				result     = touch.entity.trigger('swipe', args);

				if (result === false) {
					touch.entity = null;
					touch.layer  = null;
				}

			} else if (type === 'move') {

				args[2].x -= touch.offset.x;
				args[2].y -= touch.offset.y;
				result     = touch.entity.trigger('swipe', args);

				if (result === false) {
					touch.entity = null;
					touch.layer  = null;
				}

			} else if (type === 'end') {

				args[2].x -= touch.offset.x;
				args[2].y -= touch.offset.y;
				result     = touch.entity.trigger('swipe', args);

				if (result === false) {
					touch.entity = null;
					touch.layer  = null;
				}

			}

		}

	};

	var _on_touch = function(id, position, delta) {

		var args = [ id, {
			x: 0,
			y: 0
		}, delta ];


		var x = position.x;
		var y = position.y;


		var renderer = this.renderer;
		if (renderer !== null) {

			x -= renderer.offset.x;
			y -= renderer.offset.y;

		}


		var touch_layer  = null;
		var touch_entity = null;

		for (var lid in this.__layers) {

			var layer = this.__layers[lid];
			if (layer.visible === false) continue;

			if (lychee.interfaceof(lychee.ui.Layer, layer)) {

				args[1].x = x - layer.position.x;
				args[1].y = y - layer.position.y;


				var result = layer.trigger('touch', args);
				if (result !== true && result !== false && result !== null) {

					touch_entity = result;
					touch_layer  = layer;

					break;

				}

			}

		}


		var old_focus = this.__focus;
		var new_focus = touch_entity;

		// 1. Reset Touch trace data if no Entity was touched
		if (new_focus === null) {
			this.__touches[id].entity = null;
			this.__touches[id].layer  = null;
		}


		// 2. Change Focus State Interaction
		if (new_focus !== old_focus) {

			if (old_focus !== null) {

				if (old_focus.state !== 'default') {
					old_focus.trigger('blur');
				}

			}

			if (new_focus !== null) {

				if (new_focus.state === 'default') {
					new_focus.trigger('focus');
				}

			}


			this.__focus = new_focus;

		}


		// 3. Prepare UI Swipe event
		if (touch_entity !== null) {

			var touch = this.__touches[id];

			touch.entity = new_focus;
			touch.layer  = touch_layer;


			_trace_entity_offset.call(
				touch.offset,
				touch.entity,
				touch.layer
			);

		}

	};

	var _trace_entity_offset = function(entity, layer, offsetX, offsetY) {

		if (offsetX === undefined || offsetY === undefined) {

			this.x  = 0;
			this.y  = 0;
			offsetX = layer.position.x;
			offsetY = layer.position.y;

		}


		if (layer === entity) {

			this.x = offsetX;
			this.y = offsetY;

			return true;

		} else if (layer.entities !== undefined) {

			var entities = layer.entities;
			for (var e = entities.length - 1; e >= 0; e--) {

				var dx = layer.offset.x + entities[e].position.x;
				var dy = layer.offset.y + entities[e].position.y;


				var result = _trace_entity_offset.call(
					this,
					entity,
					entities[e],
					offsetX + dx,
					offsetY + dy
				);

				if (result === true) {
					return true;
				}

			}

		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.main     = main          || null;
		this.client   = main.client   || null;
		this.server   = main.server   || null;

		this.input    = main.input    || null;
		this.jukebox  = main.jukebox  || null;
		this.loop     = main.loop     || null;
		this.renderer = main.renderer || null;
		this.storage  = main.storage  || null;
		this.viewport = main.viewport || null;


		this.__cache   = [];
		this.__layers  = {};
		this.__focus   = null;
		this.__touches = [
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } },
			{ entity: null, layer: null, offset: { x: 0, y: 0 } }
		];



		/*
		 * INITIALIZATION
		 */

		var viewport = this.viewport;
		if (viewport !== null) {
			viewport.bind('reshape', _on_reshape, this);
		}

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		deserialize: function(blob) {

			if (blob.layers) {

				for (var laid in blob.layers) {

					var tmp1 = this.__layers[laid] || null;
					var tmp2 = lychee.deserialize(blob.layers[laid]);

					if (tmp1 === null && tmp2 !== null) {

						this.setLayer(laid, tmp2);

					} else if (tmp1 !== null && tmp2 !== null) {

						_recursive_deserialize.call(this, tmp1, tmp2);

					}

				}

			}

		},

		serialize: function() {

			var settings = this.main !== null ? '#MAIN' : null;
			var blob     = {};


			if (Object.keys(this.__layers).length > 0) {

				blob.layers = {};

				for (var lid in this.__layers) {
					blob.layers[lid] = lychee.serialize(this.__layers[lid]);
				}

			}


			return {
				'constructor': 'lychee.app.State',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		enter: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			var input = this.input;
			if (input !== null) {
				input.bind('key',    _on_key,    this);
				input.bind('scroll', _on_scroll, this);
				input.bind('swipe',  _on_swipe,  this);
				input.bind('touch',  _on_touch,  this);
			}


			if (oncomplete !== null) {
				oncomplete(true);
			}

		},

		leave: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			var focus = this.__focus;
			if (focus !== null) {
				focus.trigger('blur');
			}


			for (var t = 0, tl = this.__touches.length; t < tl; t++) {

				var touch = this.__touches[t];
				if (touch.entity !== null) {
					touch.entity = null;
					touch.layer  = null;
				}

			}


			this.__focus = null;


			var input = this.input;
			if (input !== null) {
				input.unbind('touch',  _on_touch,  this);
				input.unbind('swipe',  _on_swipe,  this);
				input.unbind('scroll', _on_scroll, this);
				input.unbind('key',    _on_key,    this);
			}


			if (oncomplete !== null) {
				oncomplete(true);
			}

		},

		render: function(clock, delta, custom) {

			custom = custom === true;


			var renderer = this.renderer;
			if (renderer !== null) {

				if (custom === false) {
					renderer.clear();
				}


				var cache = this.__cache;
				for (var c = 0, cl = cache.length; c < cl; c++) {

					var layer = this.__layers[cache[c]];
					if (layer.visible === false) continue;

					layer.render(
						renderer,
						0,
						0
					);

				}


				if (custom === false) {
					renderer.flush();
				}

			}

		},

		update: function(clock, delta) {

			for (var id in this.__layers) {

				var layer = this.__layers[id];
				if (layer.visible === false) continue;

				layer.update(clock, delta);

			}

		},



		/*
		 * LAYER API
		 */

		setLayer: function(id, layer) {

			id    = typeof id === 'string'                                                                      ? id    : null;
			layer = (lychee.interfaceof(lychee.app.Layer, layer) || lychee.interfaceof(lychee.ui.Layer, layer)) ? layer : null;


			if (id !== null) {

				if (layer !== null) {

					this.__layers[id] = layer;
					this.__cache      = Object.keys(this.__layers).sort();

					return true;

				}

			}


			return false;

		},

		getLayer: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && this.__layers[id] !== undefined) {
				return this.__layers[id];
			}


			return null;

		},

		queryLayer: function(id, query) {

			id    = typeof id === 'string'    ? id    : null;
			query = typeof query === 'string' ? query : null;


			if (id !== null && query !== null) {

				var layer = this.getLayer(id);
				if (layer !== null) {

					var entity = layer;
					var ids    = query.split(' > ');

					for (var i = 0, il = ids.length; i < il; i++) {

						entity = entity.getEntity(ids[i]);

						if (entity === null) {
							break;
						}

					}


					return entity;

				}

			}


			return null;

		},

		removeLayer: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && this.__layers[id] !== undefined) {

				delete this.__layers[id];
				this.__cache = Object.keys(this.__layers).sort();

				return true;

			}


			return false;

		}

	};


	return Class;

});

