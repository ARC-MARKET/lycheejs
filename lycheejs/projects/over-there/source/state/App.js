
lychee.define('app.state.App').requires([
	'lychee.effect.Alpha',
	'lychee.effect.Position',
	'app.sprite.Background',
	'app.sprite.Astronaut',
	'app.sprite.Emblem',
	'app.sprite.Midground',
	'app.sprite.Airlock',
	'app.sprite.Room',
	'app.ui.layer.Overlay'
]).includes([
	'lychee.app.State'
]).exports((lychee, global, attachments) => {

	const _Alpha     = lychee.import('lychee.effect.Alpha');
	const _Astronaut = lychee.import('app.sprite.Astronaut');
	const _Position  = lychee.import('lychee.effect.Position');
	const _Room      = lychee.import('app.sprite.Room');
	const _State     = lychee.import('lychee.app.State');
	const _BLOB      = attachments['json'].buffer;
	const _MUSIC     = attachments['msc'];



	/*
	 * HELPERS
	 */

	const _get_room = function(name) {

		let entities = this.query('bg3 > ship').entities.filter(e => e instanceof _Room && e.state === name);
		if (entities.length > 0) {
			return entities[0];
		}


		return null;

	};

	const _animate_astronaut = function(astronaut) {

		// sleeping ... zZzZz
		if (astronaut.state === 'default') {
			return;
		}


		let room = astronaut.room || null;
		if (room !== null) {

			let rw = room.width  - 16;
			let rh = room.height - 16;

			let target_x = room.position.x - (rw / 2) + (Math.random() * rw);
			let target_y = room.position.y - (rh / 2) + (Math.random() * rh);

			if (target_x > astronaut.position.x) {
				astronaut.state = 'working-right';
			} else {
				astronaut.state = 'working-left';
			}


			astronaut.addEffect(new _Position({
				type:     _Position.TYPE.linear,
				duration: 6000,
				origin:   {
					x: astronaut.position.x,
					y: astronaut.position.y
				},
				position: {
					x: target_x,
					y: target_y
				}
			}));

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(main) {

		_State.call(this, main);


		this.__entity = null;


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


					entity = this.query('bg1 > background');
					entity.width  = width;
					entity.height = height;

					entity = this.query('bg2 > midground');
					entity.width  = width;
					entity.height = height;

					entity = this.query('bg2 > emblem');
					entity.position.x = 1 / 2 * width - 128;
					entity.position.y = 1 / 2 * height - 32;

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
			data['constructor'] = 'app.state.App';


			return data;

		},

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			let entity = null;
			let client = this.client;

			/*
			 * HELP LAYER
			 */

			this.__overlay = this.query('ui > overlay');


			entity = this.getLayer('ui');
			entity.bind('touch', function(id, position, delta) {

				let entity = null;
				let target = this.query('bg3 > ship').getEntity(null, position);


				if (target !== null) {

					this.__entity = target;
					this.__overlay.setEntity(target);
					this.__overlay.setPosition(target.position);
					this.__overlay.setVisible(true);

					entity = this.query('bg2 > midground');
					entity.alpha = 1.0;
					entity.addEffect(new _Alpha({
						type:     _Alpha.TYPE.easeout,
						alpha:    0.1,
						duration: 300
					}));

					entity = this.query('bg3 > ship');
					entity.entities.forEach(other => {

						if (other !== target) {

							other.addEffect(new _Alpha({
								type:     _Alpha.TYPE.easeout,
								alpha:    0.1,
								duration: 300
							}));

						} else {

							other.addEffect(new _Alpha({
								type:     _Alpha.TYPE.easeout,
								alpha:    1.0,
								duration: 300
							}));

						}

					});

				} else if (this.__entity !== null) {

					this.__entity = null;
					this.__overlay.setEntity(null);
					this.__overlay.setVisible(false);

					entity = this.query('bg2 > midground');
					entity.alpha = 0.1;
					entity.addEffect(new _Alpha({
						type:     _Alpha.TYPE.easeout,
						alpha:    1.0,
						duration: 500
					}));

					entity = this.query('bg3 > ship');
					entity.entities.forEach(other => {

						other.addEffect(new _Alpha({
							type:     _Alpha.TYPE.easeout,
							alpha:    1.0,
							duration: 300
						}));

					});

				}

			}, this);


			if (client !== null) {

				client.bind('sensor', function(name, property, value) {

					let room = _get_room.call(this, name);
					if (room !== null) {
						room.properties[property] = value;
					}

				}, this);

			}


			this.query('bg3 > ship').entities.filter(e => e instanceof _Room).forEach(room => {
				room.properties['name'] = room.state;
			});



			let astronauts      = [];
			let astronaut_index = 0;

			if (client !== null) {

				client.bind('astronaut', function(data) {

					let room     = _get_room.call(this, data.room);
					let state    = data.activity === 'sleep' ? 'default' : (Math.random() > 0.5 ? 'working-right' : 'working-left');
					let position = {
						x: room.position.x,
						y: room.position.y,
						z: 2
					};

					let astronaut = new _Astronaut({
						state:      state,
						position:   position,
						properties: {
							name:         data.firstName,
							agency:       data.agency,
							teamPosition: data.position,
							activity:     data.activity,
							avatar:       data.position
						}
					});


					astronaut.room  = room;
					astronaut.alpha = 0.0;
					astronaut.addEffect(new _Alpha({
						type:     _Alpha.TYPE.easeout,
						alpha:    1.0,
						duration: 600,
						delay:    astronauts.length * 300
					}));


					let ship = this.query('bg3 > ship');
					if (ship !== null) {
						astronauts.push(astronaut);
						ship.addEntity(astronaut);
					}

				}, this);

			}


			this.loop.setInterval(3000, function() {

				astronaut_index++;
				astronaut_index %= astronauts.length;

				let astronaut = astronauts[astronaut_index] || null;
				if (astronaut !== null) {
					_animate_astronaut.call(this, astronaut);
				}

			}, this);

		},



		/*
		 * CUSTOM API
		 */

		update: function(clock, delta) {

			let background = this.query('bg1 > background');
			if (background !== null) {

				background.setOrigin({
					x: background.origin.x + 1 / 250 * delta
				});

			}


			_State.prototype.update.call(this, clock, delta);

		},

		enter: function(oncomplete, data) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;
			data       = data instanceof Object         ? data       : null;


			this.jukebox.play(_MUSIC);


			return _State.prototype.enter.call(this, oncomplete);

		},

		leave: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			this.jukebox.stop(_MUSIC);


			return _State.prototype.leave.call(this, oncomplete);

		}

	};


	return Composite;

});
