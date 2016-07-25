
lychee.define('game.net.remote.Control').includes([
	'lychee.net.remote.Session'
]).exports(function(lychee, global, attachments) {

	var _Session = lychee.import('lychee.net.remote.Session');



	/*
	 * HELPERS
	 */

	var _id       = 0;
	var _sessions = {};

	var _on_plug = function() {

		var found = null;

		Object.values(_sessions).forEach(function(session) {

			if (session.active === false && session.tunnels.length < 6) {
				found = session;
			}

		});


		if (found !== null) {

			found.players.push(this.tunnel.host + ':' + this.tunnel.port);
			found.positions.push({ x: -1, y: -1 });
			found.tunnels.push(this.tunnel);

		} else {

			var id = 'lethalmaze-' + _id++;


			found = _sessions[id] = {
				id:        id,
				active:    false,
				timeout:   10000,
				players:   [ this.tunnel.host + ':' + this.tunnel.port ],
				positions: [ { x: -1, y: -1 }],
				tunnels:   [ this.tunnel    ]
			};


			var handle = setInterval(function() {

				var timeout = this.timeout;
				if (timeout > 1000) {

					this.timeout -= 1000;


					for (var t = 0, tl = this.tunnels.length; t < tl; t++) {

						this.tunnels[t].send({
							sid:     this.id,
							tid:     t,
							players: this.players,
							timeout: this.timeout
						}, {
							id:    'control',
							event: 'update'
						});

					}

				} else {

					clearInterval(handle);

					this.active  = true;
					this.timeout = 0;


					for (var t = 0, tl = this.tunnels.length; t < tl; t++) {

						this.tunnels[t].send({
							sid:       this.id,
							tid:       t,
							players:   this.players,
							timeout:   this.timeout
						}, {
							id:    'control',
							event: 'start'
						});

					}

				}

			}.bind(found), 1000);

		}


		var tunnel = this.tunnel;
		if (tunnel !== null) {

			tunnel.send({
				sid:       found.id,
				tid:       found.tunnels.indexOf(tunnel),
				players:   found.players,
				timeout:   found.timeout
			}, {
				id:    'control',
				event: 'init'
			});

		}

	};

	var _on_control = function(data) {

		for (var id in _sessions) {

			var session = _sessions[id];
			var tid     = session.tunnels.indexOf(this.tunnel);
			if (tid !== -1) {

				if (data.position instanceof Object) {
					session.positions[tid].x = data.position.x || 0;
					session.positions[tid].y = data.position.y || 0;
				}


				for (var t = 0, tl = session.tunnels.length; t < tl; t++) {

					var tunnel = session.tunnels[t];
					if (tunnel !== this.tunnel) {

						tunnel.send({
							sid:       session.id,
							tid:       tid,
							players:   session.players,
							positions: session.positions,
							action:    data.action,
							direction: data.direction
						}, {
							id:    'control',
							event: 'control'
						});

					}

				}

			}

		}

	};

	var _on_unplug = function() {

		var found = false;


		for (var id in _sessions) {

			var session = _sessions[id];
			var index   = session.tunnels.indexOf(this.tunnel);
			if (index !== -1) {

				session.players.splice(index, 1);
				session.positions.splice(index, 1);
				session.tunnels.splice(index, 1);
				found = true;


				for (var t = 0, tl = session.tunnels.length; t < tl; t++) {

					session.tunnels[t].send({
						sid:     session.id,
						tid:     t,
						players: session.players
					}, {
						id:    'control',
						event: 'update'
					});

				}

			}

		}


		for (var id in _sessions) {

			var session = _sessions[id];
			if (session.tunnels.length === 0) {
				delete _sessions[id];
			}

		}


		return true;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(remote) {

		var settings = {};


		_Session.call(this, 'control', remote, settings);


		this.bind('plug',    _on_plug,    this);
		this.bind('unplug',  _on_unplug,  this);
		this.bind('control', _on_control, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Session.prototype.serialize.call(this);
			data['constructor'] = 'game.net.remote.Control';


			return data;

		}

	};


	return Composite;

});

