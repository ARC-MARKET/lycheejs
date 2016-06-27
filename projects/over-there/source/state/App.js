
lychee.define('app.state.App').requires([
	'lychee.effect.Alpha',
	'lychee.effect.Position',
	'app.entity.Background',
	'app.entity.Astronaut',
	'app.entity.Emblem',
	'app.entity.Midground',
	'app.entity.Airlock',
	'app.entity.Room',
	'app.ui.layer.Overlay'
]).includes([
	'lychee.app.State'
]).exports(function(lychee, global, attachments) {

	var _Alpha     = lychee.import('lychee.effect.Alpha');
	var _Astronaut = lychee.import('app.entity.Astronaut');
	var _Position  = lychee.import('lychee.effect.Position');
	var _Room      = lychee.import('app.entity.Room');
	var _State     = lychee.import('lychee.app.State');
	var _BLOB      = attachments["json"].buffer;



	/*
	 * HELPERS
	 */

	var _get_room = function(name) {

		var entities = this.queryLayer('foreground', 'ship').entities.filter(function(val) {
			return val instanceof _Room && val.state === name;
		});


		if (entities.length > 0) {
			return entities[0];
		}


		return null;

	};

	var _animate_astronaut = function(astronaut) {

		// sleeping ... zZzZz
		if (astronaut.state === 'default') {
			return;
		}


		var room = astronaut.room || null;
		if (room !== null) {

			var rw = room.width  - 16;
			var rh = room.height - 16;

			var target_x = room.position.x - (rw / 2) + (Math.random() * rw);
			var target_y = room.position.y - (rh / 2) + (Math.random() * rh);

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

	var Class = function(main) {

		_State.call(this, main);


		this.__entity = null;


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


					entity = this.queryLayer('background', 'background');
					entity.width  = width;
					entity.height = height;

					entity = this.queryLayer('midground', 'midground');
					entity.width  = width;
					entity.height = height;

					entity = this.queryLayer('midground', 'emblem');
					entity.position.x = 1/2 * width - 128;
					entity.position.y = 1/2 * height - 32;

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
			data['constructor'] = 'app.state.App';


			return data;

		},

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			var entity = null;
			var client = this.client;

			/*
			 * HELP LAYER
			 */

			this.__overlay = this.queryLayer('ui', 'overlay');


			entity = this.getLayer('ui');
			entity.bind('touch', function(id, position, delta) {

				var entity = null;
				var target = this.queryLayer('foreground', 'ship').getEntity(null, position);


				if (target !== null) {

					this.__entity = target;
					this.__overlay.setEntity(target);
					this.__overlay.setPosition(target.position);
					this.__overlay.setVisible(true);

					entity = this.queryLayer('midground', 'midground');
					entity.alpha = 1.0;
					entity.addEffect(new _Alpha({
						type:     _Alpha.TYPE.easeout,
						alpha:    0.1,
						duration: 300
					}));

					entity = this.queryLayer('foreground', 'ship');
					entity.entities.forEach(function(other) {

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

					entity = this.queryLayer('midground', 'midground');
					entity.alpha = 0.1;
					entity.addEffect(new _Alpha({
						type:     _Alpha.TYPE.easeout,
						alpha:    1.0,
						duration: 500
					}));

					entity = this.queryLayer('foreground', 'ship');
					entity.entities.forEach(function(other) {

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

					var room = _get_room.call(this, name);
					if (room !== null) {
						room.properties[property] = value;
					}

				}, this);

			}


			this.queryLayer('foreground', 'ship').entities.filter(function(val) {
				return val instanceof _Room;
			}).forEach(function(room) {
				room.properties['name'] = room.state;
			});



			var astronauts      = [];
			var astronaut_index = 0;

			if (client !== null) {

				client.bind('astronaut', function(data) {

					var room     = _get_room.call(this, data.room);
					var state    = data.activity === 'sleep' ? 'default' : (Math.random() > 0.5 ? 'working-right' : 'working-left');
					var position = {
						x: room.position.x,
						y: room.position.y,
						z: 2
					};

					var astronaut = new _Astronaut({
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
					}))


					astronauts.push(astronaut);

					this.queryLayer('foreground', 'ship').addEntity(astronaut);

				}, this);

			}


			this.loop.setInterval(3000, function() {

				astronaut_index++;
				astronaut_index %= astronauts.length;

				var astronaut = astronauts[astronaut_index] || null;
				if (astronaut !== null) {
					_animate_astronaut.call(this, astronaut);
				}

			}, this);

		},



		/*
		 * CUSTOM API
		 */

		update: function(clock, delta) {

			var background = this.queryLayer('background', 'background');
			if (background !== null) {

				background.setOrigin({
					x: background.origin.x + 1/250 * delta
				});

			}


			_State.prototype.update.call(this, clock, delta);

		},

		render: function(clock, delta) {

			_State.prototype.render.call(this, clock, delta);

		}

	};


	return Class;

});
