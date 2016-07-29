
lychee.define('lychee.ui.Layer').requires([
	'lychee.ui.Entity'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	const _Entity = lychee.import('lychee.ui.Entity');



	/*
	 * HELPERS
	 */

	const _validate_entity = function(entity) {

		if (entity instanceof Object) {

			if (
				typeof entity.update === 'function'
				&& typeof entity.render === 'function'
				&& typeof entity.shape === 'number'
				&& typeof entity.isAtPosition === 'function'
			) {
				return true;
			}

		}


		return false;

	};

	const _project_layer = function(mode) {

		let grid       = this.grid;
		let projection = this.projection;


		if (mode === true) {

			this.entities.forEach(function(entity) {

				let w = entity.width;
				let h = entity.height;
				let d = entity.depth;
				let x = entity.position.x;
				let y = entity.position.y;
				let z = entity.position.z;


				if (projection === Composite.PROJECTION.tile) {

					w = w * grid.width;
					h = h * grid.height;
					d = d * grid.depth;
					x = x * grid.width;
					y = y * grid.height;
					z = z * grid.depth;

				} else if (projection === Composite.PROJECTION.isometry) {

					w = w * grid.width;
					h = h * grid.height;
					d = d * grid.depth;
					x = (x - y) * grid.width;
					y = (x + y) * (grid.height / 2);
					z = z * grid.depth;

				}


				entity.width      = w;
				entity.height     = h;
				entity.depth      = d;
				entity.position.x = x;
				entity.position.y = y;
				entity.position.z = z;

			});

		} else {

			this.entities.forEach(function(entity) {

				let w = entity.width;
				let h = entity.height;
				let d = entity.depth;
				let x = entity.position.x;
				let y = entity.position.y;
				let z = entity.position.z;


				if (projection === Composite.PROJECTION.tile) {

					w = w / grid.width;
					h = h / grid.height;
					d = d / grid.depth;
					x = x / grid.width;
					y = y / grid.height;
					z = z / grid.depth;

				} else if (projection === Composite.PROJECTION.isometry) {

					w = w / grid.width;
					h = h / grid.height;
					d = d / grid.depth;
					x = (y / grid.height) + (x / (2 * grid.width));
					y = (y / grid.height) - (x / (2 * grid.width));
					z = z / grid.depth;

				}


				entity.width      = w;
				entity.height     = h;
				entity.depth      = d;
				entity.position.x = x;
				entity.position.y = y;
				entity.position.z = z;

			});

		}

	};

	const _on_relayout = function() {

		if (this.__project === true) {

			_project_layer.call(this, true);

			this.__project = false;

		} else {

			_project_layer.call(this, false);
			_project_layer.call(this, true);

			this.__project = false;

		}


		if (this.__relayout === true) {

			let hwidth  = this.width  / 2;
			let hheight = this.height / 2;
			let hdepth  = this.depth  / 2;

			for (let e = 0, el = this.entities.length; e < el; e++) {

				let entity = this.entities[e];
				if (typeof entity.trigger === 'function') {
					entity.trigger('relayout');
				}


				let boundx = Math.abs(entity.position.x + this.offset.x);
				let boundy = Math.abs(entity.position.y + this.offset.y);
				let boundz = Math.abs(entity.position.z + this.offset.z);

				if (entity.shape === lychee.ui.Entity.SHAPE.circle) {
					boundx += entity.radius;
					boundy += entity.radius;
					boundz += entity.radius;
				} else if (entity.shape === lychee.ui.Entity.SHAPE.rectangle) {
					boundx += entity.width  / 2;
					boundy += entity.height / 2;
					boundz += entity.depth  / 2;
				}

				hwidth  = Math.max(hwidth,  boundx);
				hheight = Math.max(hheight, boundy);
				hdepth  = Math.max(hdepth,  boundz);

			}


			this.width  = hwidth  * 2;
			this.height = hheight * 2;
			this.depth  = hdepth  * 2;

		}

	};

	const _on_scroll = function(id, direction, position, delta) {

		if (this.visible === false) return null;


		let triggered = null;
		let args      = [ id, direction, {
			x: position.x - this.offset.x,
			y: position.y - this.offset.y
		}, delta ];


		let entity = this.getEntity(null, args[2]);
		if (entity !== null) {

			if (typeof entity.trigger === 'function') {

				args[2].x -= entity.position.x;
				args[2].y -= entity.position.y;

				let result = entity.trigger('scroll', args);
				if (result === true) {
					triggered = entity;
				} else if (result !== false) {
					triggered = result;
				}

			}

		}


		return triggered;

	};

	const _on_touch = function(id, position, delta) {

		if (this.visible === false) return null;


		let triggered = null;
		let args      = [ id, {
			x: position.x - this.offset.x,
			y: position.y - this.offset.y
		}, delta ];


		let entity = this.getEntity(null, args[1]);
		if (entity !== null) {

			if (typeof entity.trigger === 'function') {

				args[1].x -= entity.position.x;
				args[1].y -= entity.position.y;

				let result = entity.trigger('touch', args);
				if (result === true) {
					triggered = entity;
				} else if (result !== false) {
					triggered = result;
				}

			}

		}


		return triggered;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.width  = typeof settings.width  === 'number' ? settings.width  : 0;
		this.height = typeof settings.height === 'number' ? settings.height : 0;
		this.depth  = typeof settings.depth === 'number'  ? settings.depth  : 0;
		this.radius = typeof settings.radius === 'number' ? settings.radius : 0;

		this.alpha      = 1;
		this.effects    = [];
		this.entities   = [];
		this.grid       = { width: 0, height: 0, depth: 0 };
		this.offset     = { x: 0, y: 0, z: 0 };
		this.position   = { x: 0, y: 0, z: 0 };
		this.projection = Composite.PROJECTION.pixel;
		this.shape      = lychee.ui.Entity.SHAPE.rectangle;
		this.visible    = true;

		this.__map      = {};
		this.__project  = true;
		this.__relayout = true;


		this.setAlpha(settings.alpha);
		this.setEntities(settings.entities);
		this.setGrid(settings.grid);
		this.setOffset(settings.offset);
		this.setProjection(settings.projection);
		this.setPosition(settings.position);
		this.setRelayout(settings.relayout);
		this.setVisible(settings.visible);


		lychee.event.Emitter.call(this);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('scroll',   _on_scroll,   this);
		this.bind('touch',    _on_touch,    this);
		this.bind('relayout', _on_relayout, this);

	};


	Composite.PROJECTION = {
		pixel:    0,
		tile:     1,
		isometry: 2
	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.entities instanceof Array) {

				let entities = [];
				let map      = {};

				for (let be = 0, bel = blob.entities.length; be < bel; be++) {
					entities.push(lychee.deserialize(blob.entities[be]));
				}


				if (blob.map instanceof Object) {

					for (let bid in blob.map) {

						let index = blob.map[bid];
						if (typeof index === 'number') {
							map[bid] = index;
						}

					}

				}


				for (let e = 0, el = entities.length; e < el; e++) {

					let id = null;
					for (let mid in map) {

						if (map[mid] === e) {
							id = mid;
						}

					}


					if (id !== null) {
						this.setEntity(id, entities[e]);
					} else {
						this.addEntity(entities[e]);
					}

				}

			}


			if (blob.project === false) {
				this.__project = false;
			}

		},

		serialize: function() {

			let settings = {};
			let blob     = {};


			if (this.width  !== 0) settings.width  = this.width;
			if (this.height !== 0) settings.height = this.height;
			if (this.depth !== 0)  settings.depth  = this.depth;
			if (this.radius !== 0) settings.radius = this.radius;


			if (this.grid.width !== 0 || this.grid.height !== 0 || this.grid.depth !== 0) {

				settings.grid = {};

				if (this.grid.width !== 0)  settings.grid.width  = this.grid.width;
				if (this.grid.height !== 0) settings.grid.height = this.grid.height;
				if (this.grid.depth !== 0)  settings.grid.depth  = this.grid.depth;

			}

			if (this.offset.x !== 0 || this.offset.y !== 0 || this.offset.z !== 0) {

				settings.offset = {};

				if (this.offset.x !== 0) settings.offset.x = this.offset.x;
				if (this.offset.y !== 0) settings.offset.y = this.offset.y;
				if (this.offset.z !== 0) settings.offset.z = this.offset.z;

			}

			if (this.position.x !== 0 || this.position.y !== 0 || this.position.z !== 0) {

				settings.position = {};

				if (this.position.x !== 0) settings.position.x = this.position.x;
				if (this.position.y !== 0) settings.position.y = this.position.y;
				if (this.position.z !== 0) settings.position.z = this.position.z;

			}

			if (this.alpha !== 1)                           settings.alpha      = this.alpha;
			if (this.__project !== true)                    blob.project        = this.__project;
			if (this.projection !== Composite.PROJECTION.pixel) settings.projection = this.projection;
			if (this.__relayout !== true)                   settings.relayout   = this.__relayout;
			if (this.visible !== true)                      settings.visible    = this.visible;


			if (this.entities.length > 0) {
				blob.entities = this.entities.map(lychee.serialize);
			}


			if (blob.entities instanceof Array && Object.keys(this.__map).length > 0) {

				blob.map = Object.map(this.__map, function(val, key) {

					let index = this.entities.indexOf(val);
					if (index !== -1) {
						return index;
					}


					return undefined;

				}, this);

			}


			return {
				'constructor': 'lychee.ui.Layer',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let alpha    = this.alpha;
			let position = this.position;
			let offset   = this.offset;


			let ox = position.x + offsetX + offset.x;
			let oy = position.y + offsetY + offset.y;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			let entities = this.entities;
			for (let e = 0, el = entities.length; e < el; e++) {

				entities[e].render(
					renderer,
					ox,
					oy
				);

			}


			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}


			if (lychee.debug === true) {

				ox = position.x + offsetX;
				oy = position.y + offsetY;


				let hwidth  = this.width  / 2;
				let hheight = this.height / 2;


				renderer.drawBox(
					ox - hwidth,
					oy - hheight,
					ox + hwidth,
					oy + hheight,
					'#ff00ff',
					false,
					1
				);

			}

		},

		update: function(clock, delta) {

			let entities = this.entities;
			for (let en = 0, enl = entities.length; en < enl; en++) {
				entities[en].update(clock, delta);
			}

			let effects = this.effects;
			for (let ef = 0, efl = this.effects.length; ef < efl; ef++) {

				let effect = this.effects[ef];
				if (effect.update(this, clock, delta) === false) {
					this.removeEffect(effect);
					efl--;
					ef--;
				}

			}

		},



		/*
		 * CUSTOM API
		 */

		isAtPosition: function(position) {

			if (position instanceof Object) {

				if (typeof position.x === 'number' && typeof position.y === 'number') {

					let ax = position.x;
					let ay = position.y;
					let bx = this.position.x;
					let by = this.position.y;


					let shape = this.shape;
					if (shape === lychee.ui.Entity.SHAPE.circle) {

						let dist = Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
						if (dist < this.radius) {
							return true;
						}

					} else if (shape === lychee.ui.Entity.SHAPE.rectangle) {

						let hwidth  = this.width  / 2;
						let hheight = this.height / 2;
						let colX    = (ax >= bx - hwidth)  && (ax <= bx + hwidth);
						let colY    = (ay >= by - hheight) && (ay <= by + hheight);


						return colX && colY;

					}

				}

			}


			return false;

		},

		setAlpha: function(alpha) {

			alpha = (typeof alpha === 'number' && alpha >= 0 && alpha <= 1) ? alpha : null;


			if (alpha !== null) {

				this.alpha = alpha;

				return true;

			}


			return false;

		},

		addEffect: function(effect) {

			effect = effect instanceof Object && typeof effect.update === 'function' ? effect : null;


			if (effect !== null) {

				let index = this.effects.indexOf(effect);
				if (index === -1) {

					this.effects.push(effect);

					return true;

				}

			}


			return false;

		},

		removeEffect: function(effect) {

			effect = effect instanceof Object && typeof effect.update === 'function' ? effect : null;


			if (effect !== null) {

				let index = this.effects.indexOf(effect);
				if (index !== -1) {

					this.effects.splice(index, 1);

					return true;

				}

			}


			return false;

		},

		removeEffects: function() {

			let effects = this.effects;

			for (let e = 0, el = effects.length; e < el; e++) {

				effects[e].update(this, Infinity, 0);
				this.removeEffect(effects[e]);

				el--;
				e--;

			}


			return true;

		},

		addEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {

				let index = this.entities.indexOf(entity);
				if (index === -1) {

					this.entities.push(entity);

					if (this.__relayout === true) {
						this.trigger('relayout');
					}

					return true;

				}

			}


			return false;

		},

		setEntity: function(id, entity) {

			id     = typeof id === 'string'            ? id     : null;
			entity = _validate_entity(entity) === true ? entity : null;


			if (id !== null && entity !== null && this.__map[id] === undefined) {

				this.__map[id] = entity;

				let result = this.addEntity(entity);
				if (result === true) {
					return true;
				} else {
					delete this.__map[id];
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
					found = this.entities[num] || null;
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

		removeEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {

				let found = false;

				for (let e = 0, el = this.entities.length; e < el; e++) {

					if (this.entities[e] === entity) {
						this.entities.splice(e, 1);
						found = true;
						el--;
						e--;
					}

				}


				for (let id in this.__map) {

					if (this.__map[id] === entity) {
						delete this.__map[id];
						found = true;
					}

				}


				if (found === true) {

					if (this.__relayout === true) {
						this.trigger('relayout');
					}

				}


				return found;

			}


			return false;

		},

		setEntities: function(entities) {

			let all = true;

			if (entities instanceof Array) {

				this.entities = [];

				for (let e = 0, el = entities.length; e < el; e++) {

					let result = this.addEntity(entities[e]);
					if (result === false) {
						all = false;
					}

				}

			}


			return all;

		},

		removeEntities: function() {

			let entities = this.entities;

			for (let e = 0, el = entities.length; e < el; e++) {

				this.removeEntity(entities[e]);

				el--;
				e--;

			}

			return true;

		},

		setGrid: function(grid) {

			if (grid instanceof Object) {

				this.grid.width  = typeof grid.width === 'number'  ? grid.width  : this.grid.width;
				this.grid.height = typeof grid.height === 'number' ? grid.height : this.grid.height;
				this.grid.depth  = typeof grid.depth === 'number'  ? grid.depth  : this.grid.depth;

				return true;

			}


			return false;

		},

		setOffset: function(offset) {

			if (offset instanceof Object) {

				this.offset.x = typeof offset.x === 'number' ? offset.x : this.offset.x;
				this.offset.y = typeof offset.y === 'number' ? offset.y : this.offset.y;
				this.offset.z = typeof offset.z === 'number' ? offset.z : this.offset.z;

				if (this.__relayout === true) {
					this.trigger('relayout');
				}


				return true;

			}


			return false;

		},

		setPosition: function(position) {

			if (position instanceof Object) {

				this.position.x = typeof position.x === 'number' ? position.x : this.position.x;
				this.position.y = typeof position.y === 'number' ? position.y : this.position.y;
				this.position.z = typeof position.z === 'number' ? position.z : this.position.z;

				return true;

			}


			return false;

		},

		setProjection: function(projection) {

			projection = lychee.enumof(Composite.PROJECTION, projection) ? projection : null;


			if (projection !== null) {

				this.projection = projection;

				return true;

			}


			return false;

		},

		setRelayout: function(relayout) {

			if (relayout === true || relayout === false) {

				this.__relayout = relayout;

				return true;

			}


			return false;

		},

		setVisible: function(visible) {

			if (visible === true || visible === false) {

				this.visible = visible;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

