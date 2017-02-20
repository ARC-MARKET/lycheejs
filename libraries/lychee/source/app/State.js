
lychee.define('lychee.app.State').requires([
	'lychee.ai.Layer',
	'lychee.app.Layer',
	'lychee.ui.Layer'
]).exports(function(lychee, global, attachments) {

	const _Ai_layer  = lychee.import('lychee.ai.Layer');
	const _App_layer = lychee.import('lychee.app.Layer');
	const _Ui_layer  = lychee.import('lychee.ui.Layer');



	/*
	 * HELPERS
	 */

	const _validate_layer = function(layer) {

		if (
			lychee.interfaceof(_Ai_layer, layer)
			|| lychee.interfaceof(_App_layer, layer)
			|| lychee.interfaceof(_Ui_layer, layer)
		) {
			return true;
		}


		return false;

	};

	const _get_id = function(entity) {

		for (let id in this.__map) {

			if (this.__map[id] === entity) {
				return id;
			}

		}


		return null;

	};

	const _recursive_deserialize = function(oldlayer, newlayer) {

		if (typeof oldlayer.setType === 'function') {
			oldlayer.setType(newlayer.type);
		}

		if (typeof oldlayer.setVisible === 'function') {
			oldlayer.setVisible(newlayer.visible);
		}


		for (let e = 0, el = newlayer.entities.length; e < el; e++) {

			let entity = newlayer.entities[e];
			let id     = _get_id.call(newlayer, entity);
			let other  = oldlayer.getEntity(id);

			if (other === null) {

				oldlayer.setEntity(id, entity);

			} else if (typeof other.entities !== 'undefined' && typeof entity.entities !== 'undefined') {

				_recursive_deserialize(other, entity);

			}

		}

	};

	const _on_key = function(key, name, delta) {

		let focus = this.__focus;
		if (focus !== null) {

			let result = focus.trigger('key', [ key, name, delta ]);
			if (result === true) {

				if (focus.state === 'default') {
					this.__focus = null;
				}

			}

		}

	};

	const _on_reshape = function(orientation, rotation, width, height) {

		let renderer = this.renderer;
		if (renderer !== null) {

			let position = {
				x: 1 / 2 * renderer.width,
				y: 1 / 2 * renderer.height
			};


			for (let id in this.__layers) {
				this.__layers[id].setPosition(position);
				this.__layers[id].trigger('relayout');
			}

		}

	};

	const _on_scroll = function(id, direction, position, delta) {

		let args = [ id, direction, {
			x: 0,
			y: 0
		}, delta ];


		let x = position.x;
		let y = position.y;


		let renderer = this.renderer;
		if (renderer !== null) {

			x -= renderer.offset.x;
			y -= renderer.offset.y;

		}


		for (let lid in this.__layers) {

			let layer = this.__layers[lid];
			if (layer.visible === false) continue;

			if (lychee.interfaceof(_Ui_layer, layer)) {

				args[2].x = x - layer.position.x;
				args[2].y = y - layer.position.y;


				let result = layer.trigger('scroll', args);
				if (result !== true && result !== false && result !== null) {
					break;
				}

			}

		}

	};

	const _on_swipe = function(id, type, position, delta, swipe) {

		let touch = this.__touches[id];
		if (touch.entity !== null) {

			if (touch.layer.visible === false) return;


			let args   = [ id, type, position, delta, swipe ];
			let result = false;

			let renderer = this.renderer;
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

	const _on_touch = function(id, position, delta) {

		let args = [ id, {
			x: 0,
			y: 0
		}, delta ];


		let x = position.x;
		let y = position.y;


		let renderer = this.renderer;
		if (renderer !== null) {

			x -= renderer.offset.x;
			y -= renderer.offset.y;

		}


		let touch_layer  = null;
		let touch_entity = null;

		for (let lid in this.__layers) {

			let layer = this.__layers[lid];
			if (layer.visible === false) continue;

			if (lychee.interfaceof(_Ui_layer, layer)) {

				args[1].x = x - layer.position.x;
				args[1].y = y - layer.position.y;


				let result = layer.trigger('touch', args);
				if (result !== true && result !== false && result !== null) {

					touch_entity = result;
					touch_layer  = layer;

					break;

				}

			}

		}


		let old_focus = this.__focus;
		let new_focus = touch_entity;

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

			let touch = this.__touches[id];

			touch.entity = new_focus;
			touch.layer  = touch_layer;


			_trace_entity_offset.call(
				touch.offset,
				touch.entity,
				touch.layer
			);

		}

	};

	const _trace_entity_offset = function(entity, layer, offsetX, offsetY) {

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

			let entities = layer.entities;
			for (let e = entities.length - 1; e >= 0; e--) {

				let dx = layer.offset.x + entities[e].position.x;
				let dy = layer.offset.y + entities[e].position.y;


				let result = _trace_entity_offset.call(
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

	let Composite = function(main) {

		this.main     = main          || null;
		this.client   = main.client   || null;
		this.server   = main.server   || null;

		this.input    = main.input    || null;
		this.jukebox  = main.jukebox  || null;
		this.loop     = main.loop     || null;
		this.renderer = main.renderer || null;
		this.storage  = main.storage  || null;
		this.viewport = main.viewport || null;


		this.__layers_map = [];
		this.__layers     = {};
		this.__focus      = null;
		this.__touches    = [
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

		let viewport = this.viewport;
		if (viewport !== null) {
			viewport.bind('reshape', _on_reshape, this);
		}

	};


	Composite.prototype = {

		/*
		 * STATE API
		 */

		deserialize: function(blob) {

			if (blob.layers) {

				for (let laid in blob.layers) {

					let tmp1 = this.__layers[laid] || null;
					let tmp2 = lychee.deserialize(blob.layers[laid]);

					if (tmp1 === null && tmp2 !== null) {

						this.setLayer(laid, tmp2);

					} else if (tmp1 !== null && tmp2 !== null) {

						_recursive_deserialize.call(this, tmp1, tmp2);

					}

				}

			}

		},

		serialize: function() {

			let settings = this.main !== null ? '#MAIN' : null;
			let blob     = {};


			if (Object.keys(this.__layers).length > 0) {

				blob.layers = {};

				for (let lid in this.__layers) {
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


			let input = this.input;
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


			let focus = this.__focus;
			if (focus !== null) {
				focus.trigger('blur');
			}


			for (let t = 0, tl = this.__touches.length; t < tl; t++) {

				let touch = this.__touches[t];
				if (touch.entity !== null) {
					touch.entity = null;
					touch.layer  = null;
				}

			}


			this.__focus = null;


			let input = this.input;
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


			let renderer = this.renderer;
			if (renderer !== null) {

				if (custom === false) {
					renderer.clear();
				}


				let layers_map = this.__layers_map;
				for (let l = 0, ll = layers_map.length; l < ll; l++) {

					let layer = this.__layers[layers_map[l]];
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

			for (let id in this.__layers) {

				let layer = this.__layers[id];
				if (layer.visible === false) continue;

				layer.update(clock, delta);

			}

		},



		/*
		 * LAYER API
		 */

		setLayer: function(id, layer) {

			id    = typeof id === 'string'          ? id    : null;
			layer = _validate_layer(layer) === true ? layer : null;


			if (id !== null) {

				if (layer !== null) {

					this.__layers[id] = layer;
					this.__layers_map = Object.keys(this.__layers).sort();

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

				let layer = this.getLayer(id);
				if (layer !== null) {

					let entity = layer;
					let ids    = query.split(' > ');

					for (let i = 0, il = ids.length; i < il; i++) {

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
				this.__layers_map = Object.keys(this.__layers).sort();

				return true;

			}


			return false;

		}

	};


	return Composite;

});

