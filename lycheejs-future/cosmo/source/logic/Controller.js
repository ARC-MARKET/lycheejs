
lychee.define('game.logic.Controller').requires([
	'game.entity.Ship'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, game, global, attachments) {

	var _service = game.net.client.Multiplayer;
	var _ship    = game.entity.Ship;



	/*
	 * HELPERS
	 */

	var _on_control = function(data) {

		if (data.id === this.id) {

			if (data.key !== null) {
				this.process(data.key, true);
			}

		}

	};

	var _on_sync = function(data) {

		if (data.id === this.id) {

			var ship = this.ship;
			if (ship !== null) {

				ship.position.x = data.px;
				ship.position.y = data.py;

				ship.velocity.x = data.vx;
				ship.velocity.y = data.vy;

			}

		}

	};

	var _service_control = function(data) {

		data.id    = this.id;
		data.key   = data.key || null;


		if (this.service !== null) {
			this.service.control(data);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(id, data) {

		var settings = lychee.extend({}, data);


		this.id = id || null;

		this.mode    = Class.MODE.offline;
		this.service = null;
		this.ship    = null;

		this.setMode(settings.mode);
		this.setService(settings.service);
		this.setShip(settings.ship);


		lychee.event.Emitter.call(this);

		settings = null;

	};


	Class.MODE = {
		offline: 0,
		online:  1
	};


	Class.prototype = {

		/*
		 * SERVICE INTEGRATION
		 */

		sync: function() {

			var ship = this.ship;
			if (ship !== null) {

				var data = {
					id: this.id,
					update: {
						px: ship.position.x | 0,
						py: ship.position.y | 0,
						vx: ship.velocity.x | 0,
						vy: ship.velocity.y | 0
					}
				};


				var service = this.service;
				if (service !== null) {
					service.sync(data);
				}

			}

		},

		process: function(key, silent) {

			silent = silent === true;


			var processed = false;

			var ship = this.ship;
			if (ship !== null) {

				ship.stop();

				switch(key) {

					case 'arrow-left':  ship.left();  processed = true; break;
					case 'arrow-right': ship.right(); processed = true; break;
					case 'm':           ship.fire();  processed = true; break;
					case 'n':           ship.bomb();  processed = true; break;

				}

			}


			if (
				   silent === false
				&& processed === true
				&& this.mode === Class.MODE.online
			) {

				_service_control.call(this, {
					key: key
				});

			}

		},



		/*
		 * CUSTOM API
		 */

		setMode: function(mode) {

			if (lychee.enumof(Class.MODE, mode) === true) {

				this.mode = mode;

				return true;

			}


			return false;

		},

		setService: function(service) {

			if (service instanceof _service) {

				this.service = service;
				this.service.bind('control', _on_control, this);
				this.service.bind('sync',    _on_sync,    this);

				return true;

			} else if (service === null) {

				this.service.unbind('sync',    _on_sync,    this);
				this.service.unbind('control', _on_control, this);
				this.service = null;

				return true;

			}


			return false;

		},

		setShip: function(ship) {

			if (ship instanceof _ship) {

				this.ship = ship;

				return true;

			}


			return false;

		}

	};


	return Class;

});

