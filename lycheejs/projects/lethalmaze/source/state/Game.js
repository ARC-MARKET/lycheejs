
lychee.define('game.state.Game').requires([
	'lychee.app.Layer',
	'lychee.effect.Shake',
	'lychee.ui.Layer',
	'game.app.sprite.Bullet',
	'game.app.sprite.Item',
	'game.app.sprite.Portal',
	'game.app.sprite.Tank',
	'game.app.sprite.Wall',
	'game.data.LEVEL',
	'game.effect.Explosion',
	'game.effect.Lightning',
	'game.ui.entity.Timeout',
	'game.ui.layer.Control'
]).includes([
	'lychee.app.State'
]).exports((lychee, global, attachments) => {

	const _Explosion = lychee.import('game.effect.Explosion');
	const _Lightning = lychee.import('game.effect.Lightning');
	const _Bullet    = lychee.import('game.app.sprite.Bullet');
	const _Item      = lychee.import('game.app.sprite.Item');
	const _Shake     = lychee.import('lychee.effect.Shake');
	const _State     = lychee.import('lychee.app.State');
	const _Tank      = lychee.import('game.app.sprite.Tank');
	const _Wall      = lychee.import('game.app.sprite.Wall');
	const _LEVEL     = lychee.import('game.data.LEVEL');
	const _BLOB      = attachments['json'].buffer;
	const _LEVELS    = attachments['levels.json'].buffer;
	const _MUSIC     = attachments['msc'];
	const _SOUNDS    = {
		kill:  attachments['kill.snd'],
		spawn: attachments['spawn.snd']
	};



	/*
	 * HELPERS
	 */

	const _lightning_effect = function(position) {

		position = position instanceof Object ? position : null;


		let portal = this.query('game > portals > portal');
		if (portal !== null) {

			portal.addEffect(new _Lightning({
				type:     _Lightning.TYPE.bounceeaseout,
				duration: 2000,
				position: position
			}));

		}

	};

	const _explode = function(position) {

		position = position instanceof Object ? position : null;


		let objects = this.query('game > objects');
		let terrain = this.query('game > terrain');

		if (objects !== null && terrain !== null) {

			if (objects.effects.length === 0 && terrain.effects.length === 0) {

				let diff_x = Math.random() > 0.5 ? -8 : 8;
				let diff_y = Math.random() > 0.5 ? -8 : 8;


				objects.addEffect(new _Shake({
					duration: 300,
					shake:    {
						x: diff_x,
						y: diff_y
					}
				}));

				terrain.addEffect(new _Shake({
					duration: 400,
					shake:    {
						x: diff_x / 2,
						y: diff_y / 2
					}
				}));

			}


			if (position !== null) {

				objects.addEffect(new _Explosion({
					duration: 500,
					position: {
						x: position.x,
						y: position.y
					}
				}));

			}

		}

	};

	const _randomize_position = function(entity) {

		if (entity instanceof _Tank) {

			let size     = 24;
			let objects  = this.query('game > objects');
			let position = {
				x: ((Math.random() * size - size / 2) | 0) * 32 + 16,
				y: ((Math.random() * size - size / 2) | 0) * 32 + 16
			};


			let check = objects.getEntity(null, position);
			let tries = 0;

			while (check !== null && tries < 8) {

				position.x = ((Math.random() * size - size / 2) | 0) * 32 + 16;
				position.y = ((Math.random() * size - size / 2) | 0) * 32 + 16;

				check = objects.getEntity(null, position);
				tries++;

			}

			if (check === null) {

				entity.position.x = position.x;
				entity.position.y = position.y;

			}

		}

	};

	const _spawn = function(entity) {

		let objects = this.query('game > objects');
		if (objects.entities.indexOf(entity) === -1) {

			entity.removeEffects();
			objects.addEntity(entity);

			_lightning_effect.call(this, entity.position);

		}


		if (entity instanceof _Tank) {

			entity.life      = 4;
			entity.direction = 'top';

			_SOUNDS.spawn.play();

		}

	};

	const _kill = function(entity) {

		_explode.call(this, entity.position);


		let objects = this.query('game > objects');
		if (objects.entities.indexOf(entity) !== -1) {
			entity.removeEffects();
			objects.removeEntity(entity);
		}


		if (entity instanceof _Tank) {

			_SOUNDS.kill.play();

		}

	};

	const _on_init = function(data) {

		let control = this.query('ui > control');
		let timeout = this.query('ui > timeout');

		if (control !== null && timeout !== null) {

			for (let p = 0, pl = data.players.length; p < pl; p++) {

				let tank = this.__players[p] || null;
				if (tank !== null) {

					if (data.tid === p) {
						this.__player = tank;
					}

					this.__players[p] = tank;
					_spawn.call(this, tank);

				}

			}


			timeout.setTimeout(data.timeout);
			timeout.setVisible(true);
			control.setVisible(false);

		}

	};

	const _on_control = function(data) {

		let player = this.__player;
		let result = false;
		let tid    = data.tid;

		if (tid !== null) {
			player = this.__players[tid] || null;
		}


		if (data.directions !== undefined) {

			for (let d = 0, dl = data.directions.length; d < dl; d++) {

				let dir   = data.directions[d] || null;
				let other = this.__players[d]  || null;
				if (dir !== null && other !== null) {
					other.setDirection(dir);
				}

			}

		}


		if (data.lifes !== undefined) {

			for (let l = 0, ll = data.lifes.length; l < ll; l++) {

				let life  = data.lifes[l]     || null;
				let other = this.__players[l] || null;
				if (life !== null && other !== null) {
					other.setLife(life);
				}

			}

		}


		if (data.positions !== undefined) {

			for (let p = 0, pl = data.positions.length; p < pl; p++) {

				let pos   = data.positions[p] || null;
				let other = this.__players[p] || null;
				if (pos !== null && other !== null) {

					if (pos.x !== -1 && pos.y !== -1) {

						other.removeEffects();

						other.position.x = data.positions[p].x;
						other.position.y = data.positions[p].y;

					}

				}

			}

		}


		if (player !== null) {

			if (player.visible === false) {
				return false;
			}


			let bullets  = this.query('game > bullets');
			let objects  = this.query('game > objects');
			let entity   = null;
			let position = {
				x: player.position.x,
				y: player.position.y
			};

			let velocity = {
				x: 0,
				y: 0
			};


			if (data.action === 'move') {

				if (data.direction === 'top')    position.y -= player.height;
				if (data.direction === 'right')  position.x += player.width;
				if (data.direction === 'bottom') position.y += player.height;
				if (data.direction === 'left')   position.x -= player.width;


				entity = objects.getEntity(null, position);

				if (entity === null || entity instanceof _Item) {
					result = player.move(data.direction);
				} else {
					player.setDirection(data.direction);
				}


			} else if (data.action === 'shoot') {

				result = player.shoot();

				if (result === true) {

					data.direction = player.direction;

					_explode.call(this, null);


					if (player.direction === 'top') {
						position.y -= player.height / 2;
						velocity.y -= player.height * 5;
					}

					if (player.direction === 'right') {
						position.x += player.width / 2;
						velocity.x += player.width * 5;
					}

					if (player.direction === 'bottom') {
						position.y += player.height / 2;
						velocity.y += player.height * 5;
					}

					if (player.direction === 'left') {
						position.x -= player.width / 2;
						velocity.x -= player.width * 5;
					}


					entity = new _Bullet({
						position: position,
						velocity: velocity
					});

					this.__bullets[data.tid || 0].push(entity);
					bullets.addEntity(entity);

				}

			}

		}


		return result;

	};

	const _send_change = function() {

		let client = this.client   || null;
		let player = this.__player || null;

		if (client !== null && player !== null) {

			let service = client.getService('control');
			if (service !== null) {

				service.change({
					tid:       this.__players.indexOf(player),
					direction: player.direction,
					life:      player.life,
					position:  {
						x: player.position.x,
						y: player.position.y
					}
				});

			}

		}

	};

	const _on_update = function(data) {

		if (data.players === undefined) return;


		let timeout = this.query('ui > timeout');
		if (timeout !== null) {
			timeout.setTimeout(data.timeout);
		}


		if (this.__players.length < data.players.length) {

			for (let p = 0, pl = data.players.length; p < pl; p++) {

				let tank = this.__tanks[p] || null;
				if (tank !== null) {

					if (data.tid === p) {
						this.__player = tank;
					}

					this.__players[p] = tank;
					_spawn.call(this, tank);

				}

			}

		} else if (this.__players.length > data.players.length) {

			for (let p = 0, pl = this.__players.length; p < pl; p++) {

				let tank = this.__tanks[p] || null;
				if (tank !== null) {

					if (p >= data.players.length) {

						_kill.call(this, tank);
						this.__players.splice(p, 1);
						pl--;
						p--;

					} else {

						if (data.tid === p) {
							this.__player = tank;
						}

					}

				}

			}

		}


		if (data.timeout === 0) {
			_on_start.call(this);
		}

	};

	const _on_start = function(data) {

		let control = this.query('ui > control');
		let timeout = this.query('ui > timeout');

		if (control !== null && timeout !== null) {

			control.setVisible(true);
			timeout.setVisible(false);

			this.__focus = control;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(main) {

		_State.call(this, main);


		this.__bullets = [ [], [], [], [] ];
		this.__items   = [];
		this.__tanks   = [];
		this.__player  = null;
		this.__players = [];


		this.deserialize(_BLOB);



		/*
		 * INITIALIZATION
		 */

		let viewport = this.viewport;
		if (viewport !== null) {

			viewport.bind('reshape', function(orientation, rotation) {

				let renderer = this.renderer;
				if (renderer !== null) {

					let entity = null;
					let width  = renderer.width;
					let height = renderer.height;


					entity = this.query('ui > control');
					entity.width  = width;
					entity.height = height;
					entity.trigger('relayout');

					entity = this.query('ui > timeout');
					entity.width  = width;
					entity.height = height;
					entity.trigger('relayout');

					entity = this.query('game > portals');
					entity.width  = width;
					entity.height = height;
					entity.trigger('relayout');

				}

			}, this);

		}

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'game.state.Game';


			return data;

		},

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);

		},

		update: function(clock, delta) {

			let bullets = this.query('game > bullets');
			let objects = this.query('game > objects');
			let portal  = this.query('game > portals > portal');

			if (bullets !== null && objects !== null) {

				let entities = objects.entities;
				let items    = this.__items;
				let players  = this.__players;


				for (let p = 0, pl = players.length; p < pl; p++) {

					let player = players[p];

					for (let e = 0, el = entities.length; e < el; e++) {

						let entity = entities[e];
						if (entity === player) continue;

						if (entity.collides(player)) {

							if (entity instanceof _Item) {

								let result = player.powerup();
								if (result === true) {

									items.push(entity);
									entities.splice(e, 1);
									el--;
									e--;

								}

							}

						}

					}

				}


				for (let p = 0, pl = players.length; p < pl; p++) {

					let changed = false;
					let player  = players[p];

					for (let b = 0, bl = this.__bullets[p].length; b < bl; b++) {

						let bullet = this.__bullets[p][b];

						if (bullet.collides(portal)) {

							bullet.velocity.x *= Math.abs(bullet.velocity.x) > 0 ? -1 : 1;
							bullet.velocity.y *= Math.abs(bullet.velocity.y) > 0 ? -1 : 1;

						} else {

							let entity = objects.getEntity(null, bullet.position);
							if (entity !== null && entity !== player) {

								if (entity instanceof _Tank) {
									entity.hit();
									changed = true;
								} else if (entity instanceof _Wall) {
									entity.hit();
								}


								_explode.call(this, bullet.position);

								this.__bullets[p].splice(b, 1);
								bullets.removeEntity(bullet);
								bl--;
								b--;

							}

						}

					}


					if (player.life <= 0) {

						_kill.call(this, player);
						_randomize_position.call(this, player);
						_spawn.call(this, player);

						changed = true;

					}

					if (changed === true && this.__player === player) {
						_send_change.call(this, player);
					}

				}


				if (portal.effects.length > 0) {

					for (let pe = 0, pel = portal.effects.length; pe < pel; pe++) {

						let effect = portal.effects[pe];
						if (effect instanceof _Lightning && effect.__start !== null && effect.__start < clock) {

							let entity = objects.getEntity(null, effect.position);
							if (entity !== null && entity instanceof _Wall) {
								_kill.call(this, entity);
							}

						}

					}

				}


				if (items.length >= 5) {

					// XXX: Don't spawn the latest collected item again (player still above it)

					for (let i = 0, il = 4; i < il; i++) {

						_spawn.call(this, items[i]);

						items.splice(i, 1);
						il--;
						i--;

					}

				}

			}


			_State.prototype.update.call(this, clock, delta);

		},



		/*
		 * CUSTOM API
		 */

		enter: function(oncomplete, data) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;
			data       = data instanceof Object         ? data       : { level: 'intro' };


			let level = _LEVEL.decode(_LEVELS[data.level] || null) || null;
			if (level !== null) {

				this.__bullets = [];
				this.__items   = [];
				this.__tanks   = [];
				this.__player  = null;
				this.__players = [];


				let objects = this.query('game > objects');
				if (objects !== null) {

					objects.entities = [];

					for (let o = 0, ol = level.objects.length; o < ol; o++) {

						let object = level.objects[o];

						object.position.x -= objects.width  / 2;
						object.position.y -= objects.height / 2;


						if (object instanceof _Tank) {
							this.__bullets.push([]);
							this.__tanks.push(object);
						} else {
							objects.addEntity(object);
						}

					}

				}


				let terrain = this.query('game > terrain');
				if (terrain !== null) {

					terrain.entities = [];

					for (let t = 0, tl = level.terrain.length; t < tl; t++) {

						let obj = level.terrain[t];

						obj.position.x -= terrain.width  / 2;
						obj.position.y -= terrain.height / 2;


						terrain.addEntity(obj);

					}

				}


				let client = this.client;
				if (client !== null) {

					let control = this.query('ui > control');
					let service = client.getService('control');

					if (control !== null && service !== null) {

						service.bind('init',    _on_init,    this);
						service.bind('update',  _on_update,  this);
						service.bind('start',   _on_start,   this);
						service.bind('control', _on_control, this);


						if (control !== null) {

							control.bind('change', function(data) {

								data.tid      = this.__players.indexOf(this.__player);
								data.position = {
									x: this.__player.position.x,
									y: this.__player.position.y
								};


								let result = _on_control.call(this, data);
								if (result === true) {
									service.control(data);
								}

							}, this);

						}

					}

				}


				this.query('ui > control').setVisible(false);
				this.query('ui > timeout').setVisible(true);

			}


			let input = this.input;
			if (input !== null) {

				input.unbind('key');
				input.bind('key', function(key, name, delta) {

					let control = this.query('ui > control');
					if (control !== null && control.visible === true) {
						control.trigger('key', [ key, name, delta ]);
					}

				}, this);

				input.unbind('touch', null, this);
				input.bind('touch', function(id, position, delta) {

					let control = this.query('ui > control');
					if (control !== null && control.visible === true) {
						control.trigger('touch', [ id, position, delta ]);
					}

				}, this);

				input.unbind('swipe', null, this);
				input.bind('swipe', function(id, state, position, delta, swipe) {

					let control = this.query('ui > control');
					if (control !== null && control.visible === true) {
						control.trigger('swipe', [ id, state, position, delta, swipe ]);
					}

				}, this);

			}


			let jukebox = this.jukebox;
			if (jukebox !== null) {
				jukebox.setVolume(0.25);
				jukebox.play(_MUSIC);
			}


			if (oncomplete !== null) {
				oncomplete(true);
			}


			return true;

		},

		leave: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			this.query('game > terrain').setEntities([]);
			this.query('game > objects').setEntities([]);


			let jukebox = this.jukebox;
			if (jukebox !== null) {
				jukebox.stop(_MUSIC);
				jukebox.setVolume(1.0);
			}


			let input = this.input;
			if (input !== null) {

				input.unbind('key',   null, this);
				input.unbind('touch', null, this);
				input.unbind('swipe', null, this);

			}


			let control = this.query('ui > control');
			if (control !== null) {

				control.unbind('change', null, this);
				control.setVisible(false);

			}


			let timeout = this.query('ui > timeout');
			if (timeout !== null) {
				timeout.setVisible(true);
			}


			let client = this.client;
			if (client !== null) {

				let service = client.getService('control');
				if (service !== null) {

					service.unbind('init',    _on_init,    this);
					service.unbind('update',  _on_update,  this);
					service.unbind('start',   _on_start,   this);
					service.unbind('control', _on_control, this);

				}

			}


			return _State.prototype.leave.call(this, oncomplete);

		}

	};


	return Composite;

});

