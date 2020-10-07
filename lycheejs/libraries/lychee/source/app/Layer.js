
lychee.define('lychee.app.Layer').requires([
	'lychee.app.Entity'
]).includes([
	'lychee.event.Emitter'
]).exports((lychee, global, attachments) => {

	const _Emitter = lychee.import('lychee.event.Emitter');
	const _Entity  = lychee.import('lychee.app.Entity');



	/*
	 * HELPERS
	 */

	const _validate_effect = function(effect) {

		if (effect instanceof Object) {

			if (
				typeof effect.update === 'function'
				&& typeof effect.render === 'function'
			) {
				return true;
			}

		}


		return false;

	};

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

	const _project_layer = function(mode) {

		let grid       = this.grid;
		let projection = this.projection;


		if (mode === true) {

			this.entities.forEach(entity => {

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

			this.entities.forEach(entity => {

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

				if (entity.shape === _Entity.SHAPE.circle) {
					boundx += entity.radius;
					boundy += entity.radius;
					boundz += entity.radius;
				} else if (entity.shape === _Entity.SHAPE.rectangle) {
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



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.width  = typeof states.width  === 'number' ? states.width  : 0;
		this.height = typeof states.height === 'number' ? states.height : 0;
		this.depth  = typeof states.depth === 'number'  ? states.depth  : 0;
		this.radius = typeof states.radius === 'number' ? states.radius : 0;

		this.alpha      = 1;
		this.effects    = [];
		this.entities   = [];
		this.grid       = { width: 0, height: 0, depth: 0 };
		this.offset     = { x: 0, y: 0, z: 0 };
		this.position   = { x: 0, y: 0, z: 0 };
		this.projection = Composite.PROJECTION.pixel;
		this.shape      = _Entity.SHAPE.rectangle;
		this.visible    = true;

		this.__map      = {};
		this.__project  = true;
		this.__relayout = true;


		this.setAlpha(states.alpha);
		this.setEntities(states.entities);
		this.setGrid(states.grid);
		this.setOffset(states.offset);
		this.setProjection(states.projection);
		this.setPosition(states.position);
		this.setRelayout(states.relayout);
		this.setVisible(states.visible);


		_Emitter.call(this);

		states = null;



		/*
		 * INITIALIZATION
		 */

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

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.app.Layer';

			let states = {};
			let blob     = (data['blob'] || {});


			if (this.width  !== 0) states.width  = this.width;
			if (this.height !== 0) states.height = this.height;
			if (this.depth !== 0)  states.depth  = this.depth;
			if (this.radius !== 0) states.radius = this.radius;


			if (this.grid.width !== 0 || this.grid.height !== 0 || this.grid.depth !== 0) {

				states.grid = {};

				if (this.grid.width !== 0)  states.grid.width  = this.grid.width;
				if (this.grid.height !== 0) states.grid.height = this.grid.height;
				if (this.grid.depth !== 0)  states.grid.depth  = this.grid.depth;

			}

			if (this.offset.x !== 0 || this.offset.y !== 0 || this.offset.z !== 0) {

				states.offset = {};

				if (this.offset.x !== 0) states.offset.x = this.offset.x;
				if (this.offset.y !== 0) states.offset.y = this.offset.y;
				if (this.offset.z !== 0) states.offset.z = this.offset.z;

			}

			if (this.position.x !== 0 || this.position.y !== 0 || this.position.z !== 0) {

				states.position = {};

				if (this.position.x !== 0) states.position.x = this.position.x;
				if (this.position.y !== 0) states.position.y = this.position.y;
				if (this.position.z !== 0) states.position.z = this.position.z;

			}

			if (this.alpha !== 1)                               states.alpha      = this.alpha;
			if (this.__project !== true)                        blob.project        = this.__project;
			if (this.projection !== Composite.PROJECTION.pixel) states.projection = this.projection;
			if (this.__relayout !== true)                       states.relayout   = this.__relayout;
			if (this.visible !== true)                          states.visible    = this.visible;


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


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

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
			for (let en = 0, enl = entities.length; en < enl; en++) {
				entities[en].render(renderer, ox, oy);
			}

			let effects = this.effects;
			for (let ef = 0, efl = effects.length; ef < efl; ef++) {
				effects[ef].render(renderer, offsetX, offsetY);
			}


			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}


			if (lychee.debug === true) {

				let bx      = position.x + offsetX;
				let by      = position.y + offsetY;
				let hwidth  = this.width  / 2;
				let hheight = this.height / 2;


				renderer.drawBox(
					bx - hwidth,
					by - hheight,
					bx + hwidth,
					by + hheight,
					'#ffff00',
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
			for (let ef = 0, efl = effects.length; ef < efl; ef++) {

				let effect = effects[ef];
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

		collides: function(entity) {

			entity = lychee.interfaceof(_Entity, entity) ? entity : null;


			if (entity !== null) {
				// XXX: App Layers cannot collide
			}


			return false;

		},

		confines: function(position) {

			position = position instanceof Object ? position : null;


			if (position !== null) {

				if (typeof position.x === 'number' && typeof position.y === 'number') {

					let ax = position.x;
					let ay = position.y;
					let bx = this.position.x;
					let by = this.position.y;


					let shape = this.shape;
					if (shape === _Entity.SHAPE.circle) {

						let dist = Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
						if (dist < this.radius) {
							return true;
						}

					} else if (shape === _Entity.SHAPE.rectangle) {

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

		query: function(query) {

			query = typeof query === 'string' ? query : null;


			if (query !== null) {

				let tmp    = query.split(' > ');
				let eid    = tmp.shift().trim();
				let entity = this.getEntity(eid);
				if (entity !== null) {

					if (tmp.length > 0) {

						if (typeof entity.query === 'function') {
							return entity.query(tmp.join(' > ').trim());
						} else {

							if (lychee.debug === true) {
								console.warn('lychee.app.Layer: Invalid query "' + tmp.join(' > ') + '" on entity "' + eid + '".');
							}

						}

					} else {
						return entity;
					}

				}

			}


			return null;

		},

		trace: function(position) {

			position = position instanceof Object ? position : null;


			if (position !== null) {

				let found = null;
				let pos   = {
					x: (position.x || 0) + this.offset.x,
					y: (position.y || 0) + this.offset.y,
					z: (position.z || 0) + this.offset.z
				};

				for (let e = this.entities.length - 1; e >= 0; e--) {

					let entity = this.entities[e];
					if (entity.visible === false) continue;

					if (typeof entity.trace === 'function') {

						if (entity.trace(pos) !== null) {
							found = entity;
							break;
						}

					} else if (typeof entity.confines === 'function') {

						if (entity.confines(pos) === true) {
							found = entity;
							break;
						}

					}

				}

				return found;

			}


			return null;

		},

		setAlpha: function(alpha) {

			alpha = typeof alpha === 'number' ? alpha : null;


			if (alpha !== null) {

				this.alpha = Math.min(Math.max(alpha, 0), 1);

				return true;

			}


			return false;

		},

		addEffect: function(effect) {

			effect = _validate_effect(effect) ? effect : null;


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

			effect = _validate_effect(effect) ? effect : null;


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
				this.entities.push(entity);

				if (this.__relayout === true) {
					this.trigger('relayout');
				}


				return true;

			}


			return false;

		},

		getEntity: function(id, position) {

			id       = typeof id === 'string'     ? id       : null;
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

						if (entity.confines(position) === true) {
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

				let index = this.entities.indexOf(entity);
				if (index !== -1) {

					this.entities.splice(index, 1);
					found = true;

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

			entities = entities instanceof Array ? entities : null;


			let all = true;

			if (entities !== null) {

				let filtered = [];

				for (let e = 0, el = entities.length; e < el; e++) {

					let entity = entities[e];
					let index  = filtered.indexOf(entity);
					if (index === -1) {
						filtered.push(entity);
					} else {
						all = false;
					}

				}

				this.entities = filtered;

				if (this.__relayout === true) {
					this.trigger('relayout');
				}

			}

			return all;

		},

		removeEntities: function() {

			let entities = this.entities;

			for (let e = 0, el = entities.length; e < el; e++) {

				entities.splice(e, 1);
				el--;
				e--;

			}

			return true;

		},

		setGrid: function(grid) {

			grid = grid instanceof Object ? grid : null;


			if (grid !== null) {

				this.grid.width  = typeof grid.width === 'number'  ? grid.width  : this.grid.width;
				this.grid.height = typeof grid.height === 'number' ? grid.height : this.grid.height;
				this.grid.depth  = typeof grid.depth === 'number'  ? grid.depth  : this.grid.depth;

				return true;

			}


			return false;

		},

		setOffset: function(offset) {

			offset = offset instanceof Object ? offset : null;


			if (offset !== null) {

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

			position = position instanceof Object ? position : null;


			if (position !== null) {

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

			relayout = typeof relayout === 'boolean' ? relayout : null;


			if (relayout !== null) {

				this.__relayout = relayout;

				return true;

			}


			return false;

		},

		setVisible: function(visible) {

			visible = typeof visible === 'boolean' ? visible : null;


			if (visible !== null) {

				this.visible = visible;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

