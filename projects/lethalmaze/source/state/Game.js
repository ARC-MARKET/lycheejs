
lychee.define('game.state.Game').requires([
	'lychee.app.Layer',
	'lychee.effect.Shake',
	'lychee.ui.Layer',
	'game.app.sprite.Bullet',
	'game.app.sprite.Item',
	'game.app.sprite.Portal',
	'game.app.sprite.Tank',
	'game.data.LEVEL',
	'game.effect.Explosion',
	'game.effect.Lightning',
	'game.ui.entity.Timeout',
	'game.ui.layer.Control'
]).includes([
	'lychee.app.State'
]).exports(function(lychee, global, attachments) {

	var _Explosion = lychee.import('game.effect.Explosion');
	var _Lightning = lychee.import('game.effect.Lightning');
	var _Bullet    = lychee.import('game.app.sprite.Bullet');
	var _Item      = lychee.import('game.app.sprite.Item');
	var _Shake     = lychee.import('lychee.effect.Shake');
	var _State     = lychee.import('lychee.app.State');
	var _Tank      = lychee.import('game.app.sprite.Tank');
	var _Wall      = lychee.import('game.app.sprite.Wall');
	var _LEVEL     = lychee.import('game.data.LEVEL');
	var _BLOB      = attachments["json"].buffer;
	var _LEVELS    = attachments["levels.json"].buffer;
	var _MUSIC     = attachments["msc"];
	var _SOUNDS    = {
		kill:  attachments["kill.snd"],
		spawn: attachments["spawn.snd"]
	};



	/*
	 * HELPERS
	 */

	var _lightning = function(position) {

		position = position instanceof Object ? position : null;


		var portal = this.queryLayer('game', 'portals > portal');
		if (portal !== null) {

			portal.addEffect(new _Lightning({
				type:     _Lightning.TYPE.bounceeaseout,
				duration: 2000,
				position: position
			}));

			_SOUNDS.spawn.play();

		}

	};

	var _explode = function(position) {

		position = position instanceof Object ? position : null;


		var objects = this.queryLayer('game', 'objects');
		var terrain = this.queryLayer('game', 'terrain');

		if (objects !== null && terrain !== null) {

			if (objects.effects.length === 0 && terrain.effects.length === 0) {

				var diff_x = Math.random() > 0.5 ? -8 : 8;
				var diff_y = Math.random() > 0.5 ? -8 : 8;


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
				}))

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

	var _respawn = function(tank) {

		_kill.call(this, tank);


		var objects = this.queryLayer('game', 'objects');
		var portal  = this.queryLayer('game', 'portals > portal');

		if (objects !== null && portal.effects.length > 0) {

			for (var pe = 0, pel = portal.effects.length; pe < pel; pe++) {

				var effect   = portal.effects[pe];
				var position = effect.position;

				if (effect instanceof _Lightning) {

					var valid = Math.abs(position.x) > portal.width || Math.abs(position.y) > portal.height;
					if (valid === true && effect.__alpha < 0.5) {

						position.x = ((position.x / tank.width)  | 0) * tank.width  + tank.width  / 2;
						position.y = ((position.y / tank.height) | 0) * tank.height + tank.height / 2;


						var entity = objects.getEntity(null, position);
						if (entity === null) {

							tank.position.x = position.x;
							tank.position.y = position.y;

							_spawn.call(this, tank);

							return true;

						}

					}

				}

			}

		}


		if (objects !== null) {

			this.loop.setTimeout(2000, function() {
				_respawn.call(this, tank);
			}, this);

			return true;

		}

	};

	var _spawn = function(tank) {

		var objects = this.queryLayer('game', 'objects');
		if (objects.entities.indexOf(tank) === -1) {

			tank.removeEffects();
			tank.addEffect(new _Lightning({
				type:     _Lightning.TYPE.bounceeaseout,
				duration: 3000
			}));


			objects.addEntity(tank);
			_SOUNDS.spawn.play();

		}

		if (this.__players.indexOf(tank) === -1) {
			this.__players.push(tank);
		}

	};

	var _kill = function(tank) {

		var objects = this.queryLayer('game', 'objects');
		if (objects.entities.indexOf(tank) !== -1) {

			tank.removeEffects();

			objects.removeEntity(tank);
			_SOUNDS.kill.play();

		}

		var index = this.__players.indexOf(tank);
		if (index !== -1) {
			this.__players.splice(index, 1);
		}

	};

	var _on_init = function(data) {

		var control = this.queryLayer('ui', 'control');
		var timeout = this.queryLayer('ui', 'timeout');

		if (control !== null && timeout !== null) {

			for (var p = 0, pl = data.players.length; p < pl; p++) {

				var tank = this.__players[p] || null;
				if (tank !== null) {

					if (data.tid === p) {
						this.__player = tank;
					}

					_spawn.call(this, tank);

				}

			}


			timeout.setTimeout(data.timeout);
			timeout.setVisible(true);
			control.setVisible(false);

		}

	};

	var _on_control = function(data) {

		var player = this.__player;
		var result = false;
		var tid    = data.tid;

		if (tid !== null) {
			player = this.__players[tid] || null;
		}


		if (data.positions !== undefined) {

			for (var p = 0, pl = data.positions.length; p < pl; p++) {

				var pos   = data.positions[p] || null;
				var other = this.__players[p] || null;
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


			var bullets  = this.queryLayer('game', 'bullets');
			var objects  = this.queryLayer('game', 'objects');
			var entity   = null;
			var position = {
				x: player.position.x,
				y: player.position.y
			};

			var velocity = {
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

	var _on_update = function(data) {

		if (data.players === undefined) return;


		var control = this.queryLayer('ui', 'control');
		var timeout = this.queryLayer('ui', 'timeout');


		if (timeout !== null) {
			timeout.setTimeout(data.timeout);
		}


		if (this.__players.length < data.players.length) {

			for (var p = 0, pl = data.players.length; p < pl; p++) {

				var tank = this.__tanks[p] || null;
				if (tank !== null) {

					if (data.tid === p) {
						this.__player = tank;
					}

					_spawn.call(this, tank);

				}

			}

		} else if (this.__players.length > data.players.length) {

			for (var p = 0, pl = this.__players.length; p < pl; p++) {

				var tank = this.__tanks[p] || null;
				if (tank !== null) {

					if (p >= data.players.length) {

						_kill.call(this, tank);
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

	var _on_start = function(data) {

		var control = this.queryLayer('ui', 'control');
		var timeout = this.queryLayer('ui', 'timeout');

		if (control !== null && timeout !== null) {

			control.setVisible(true);
			timeout.setVisible(false);

			this.__focus = control;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		_State.call(this, main);


		this.__bullets = [[], [], [], []];
		this.__items   = [];
		this.__tanks   = [];
		this.__player  = null;
		this.__players = [];


		this.deserialize(_BLOB);



		/*
		 * INITIALIZATION
		 */

		var viewport = this.viewport;
		if (viewport !== null) {

			viewport.bind('reshape', function(orientation, rotation) {

				var renderer = this.renderer;
				if (renderer !== null) {

					var entity = null;
					var width  = renderer.width;
					var height = renderer.height;


					entity = this.queryLayer('ui', 'control');
					entity.width  = width;
					entity.height = height;
					entity.trigger('relayout');

					entity = this.queryLayer('ui', 'timeout');
					entity.width  = width;
					entity.height = height;
					entity.trigger('relayout');

					entity = this.queryLayer('game', 'portals');
					entity.width  = width;
					entity.height = height;
					entity.trigger('relayout');

				}

			}, this);

		}

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _State.prototype.serialize.call(this);
			data['constructor'] = 'game.state.Game';


			return data;

		},

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);

		},

		update: function(clock, delta) {

			var bullets = this.queryLayer('game', 'bullets');
			var objects = this.queryLayer('game', 'objects');
			var portal  = this.queryLayer('game', 'portals > portal');

			if (bullets !== null && objects !== null) {

				var entities = objects.entities;
				var items    = this.__items;
				var players  = this.__players;


				for (var p = 0, pl = players.length; p < pl; p++) {

					var player = players[p];

					for (var e = 0, el = entities.length; e < el; e++) {

						var entity = entities[e];
						if (entity === player) continue;

						if (entity.collidesWith(player)) {

							if (entity instanceof _Item) {

								var result = player.powerup();
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


				for (var p = 0, pl = players.length; p < pl; p++) {

					var player = players[p];

					for (var b = 0, bl = this.__bullets[p].length; b < bl; b++) {

						var bullet = this.__bullets[p][b];

						if (bullet.collidesWith(portal)) {

							bullet.velocity.x *= Math.abs(bullet.velocity.x) > 0 ? -1 : 1;
							bullet.velocity.y *= Math.abs(bullet.velocity.y) > 0 ? -1 : 1;

						} else {

							var entity = objects.getEntity(null, bullet.position);
							if (entity !== null && entity !== player) {

								if (entity instanceof _Tank) {
									entity.hit();
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
						_respawn.call(this, player);
					}


					for (var pe = 0, pel = portal.effects.length; pe < pel; pe++) {

						var effect = portal.effects[pe];
						if (effect.__alpha > 0.5) {

							if (player.isAtPosition(effect.position)) {
								_respawn.call(this, player);
							}

						}

					}

				}


				if (portal.effects.length > 0) {

					for (var pe = 0, pel = portal.effects.length; pe < pel; pe++) {

						var effect = portal.effects[pe];
						if (effect instanceof _Lightning && effect.__start !== null && effect.__start < clock) {

							var entity = objects.getEntity(null, effect.position);
							if (entity !== null && entity instanceof _Wall) {
								_explode.call(this, effect.position);
								objects.removeEntity(entity);
							}

						}

					}

				}


				if (items.length >= 5) {

					// XXX: Don't spawn the latest collected item again (player still above it)

					for (var i = 0, il = 4; i < il; i++) {

						objects.addEntity(items[i]);
						_lightning.call(this, items[i].position);

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

			data = data instanceof Object ? data : { level: 'intro' };


			_State.prototype.enter.call(this, oncomplete);


			var level = _LEVEL.decode(_LEVELS[data.level] || null) || null;
			if (level !== null) {

				this.__bullets = [];
				this.__items   = [];
				this.__tanks   = [];
				this.__player  = null;
				this.__players = [];


				var objects = this.queryLayer('game', 'objects');
				if (objects !== null) {

					objects.entities = [];

					for (var o = 0, ol = level.objects.length; o < ol; o++) {

						var object = level.objects[o];

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


				var terrain = this.queryLayer('game', 'terrain');
				if (terrain !== null) {

					terrain.entities = [];

					for (var t = 0, tl = level.terrain.length; t < tl; t++) {

						var obj = level.terrain[t];

						obj.position.x -= terrain.width  / 2;
						obj.position.y -= terrain.height / 2;


						terrain.addEntity(obj);

					}

				}


				var client = this.client;
				if (client !== null) {

					var control = this.queryLayer('ui', 'control');
					var service = client.getService('control');

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


								var result = _on_control.call(this, data);
								if (result === true) {
									service.control(data);
								}

							}, this);

						}

					}

				}


				this.queryLayer('ui', 'control').setVisible(false);
				this.queryLayer('ui', 'timeout').setVisible(true);

			}


			var input = this.input;
			if (input !== null) {

				input.unbind('key');
				input.bind('key', function(key, name, delta) {

					var control = this.queryLayer('ui', 'control');
					if (control !== null && control.visible === true) {
						control.trigger('key', [ key, name, delta ]);
					}

				}, this);

				input.unbind('touch', null, this);
				input.bind('touch', function(id, position, delta) {

					var control = this.queryLayer('ui', 'control');
					if (control !== null && control.visible === true) {
						control.trigger('touch', [ id, position, delta ]);
					}

				}, this);

				input.unbind('swipe', null, this);
				input.bind('swipe', function(id, state, position, delta, swipe) {

					var control = this.queryLayer('ui', 'control');
					if (control !== null && control.visible === true) {
						control.trigger('swipe', [ id, state, position, delta, swipe ]);
					}

				}, this);

			}


			var jukebox = this.jukebox;
			if (jukebox !== null) {
				jukebox.setVolume(0.25);
				jukebox.play(_MUSIC);
			}

		},

		leave: function(oncomplete) {

			this.queryLayer('game', 'terrain').setEntities([]);
			this.queryLayer('game', 'objects').setEntities([]);


			var jukebox = this.jukebox;
			if (jukebox !== null) {
				jukebox.stop(_MUSIC);
				jukebox.setVolume(1.0);
			}


			var input = this.input;
			if (input !== null) {

				input.unbind('key',   null, this);
				input.unbind('touch', null, this);
				input.unbind('swipe', null, this);

			}


			var control = this.queryLayer('ui', 'control');
			if (control !== null) {

				control.unbind('change', null, this);
				control.setVisible(false);

			}


			var timeout = this.queryLayer('ui', 'timeout');
			if (timeout !== null) {
				timeout.setVisible(true);
			}


			var client = this.client;
			if (client !== null) {

				var service = client.getService('control');
				if (service !== null) {

					service.unbind('init',    _on_init,    this);
					service.unbind('update',  _on_update,  this);
					service.unbind('start',   _on_start,   this);
					service.unbind('control', _on_control, this);

				}

			}


			_State.prototype.leave.call(this, oncomplete);

		}

	};


	return Class;

});

