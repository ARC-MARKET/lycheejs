
lychee.define('game.net.service.Control').includes([
	'lychee.net.service.Session'
]).exports((lychee, global, attachments) => {

	let   _id       = 0;
	const _Session  = lychee.import('lychee.net.service.Session');
	const _SESSIONS = {};



	/*
	 * HELPERS
	 */

	const _update_session = function(session) {

		let timeout = session.timeout;
		let tunnels = session.tunnels;

		if (timeout > 1000) {

			session.timeout -= 1000;


			for (let t = 0, tl = tunnels.length; t < tl; t++) {

				tunnels[t].send({
					sid:     session.id,
					tid:     t,
					players: session.players,
					timeout: session.timeout
				}, {
					id: this.id,
					event: 'update'
				});

			}

		} else {

			session.active  = true;
			session.timeout = 0;


			for (let t = 0, tl = tunnels.length; t < tl; t++) {

				tunnels[t].send({
					sid:     session.id,
					tid:     t,
					players: session.players,
					timeout: session.timeout
				}, {
					id: this.id,
					event: 'start'
				});

			}

		}

	};

	const _on_plug = function() {

		let tunnel = this.tunnel;
		if (tunnel !== null && tunnel.type === 'remote') {

			let session = Object.values(_SESSIONS).find(s => s.active === false && s.tunnels.length < 6) || null;
			if (session !== null) {

				session.players.push(tunnel.id);
				session.directions.push('top');
				session.lifes.push(4);
				session.positions.push({ x: -1, y: -1 });
				session.tunnels.push(tunnel);

			} else {

				let sid = 'lethalmaze-' + _id++;

				session = _SESSIONS[sid] = {
					id:         sid,
					active:     false,
					timeout:    10000,
					players:    [ tunnel.id ],
					directions: [ 'top' ],
					lifes:      [ 4 ],
					positions:  [{ x: -1, y: -1 }],
					tunnels:    [ tunnel ]
				};



				let handle = null;

				handle = setInterval(_ => {

					_update_session.call(this, session);

					if (session.timeout === 0) {
						clearInterval(handle);
						handle = null;
					}

				}, 1000);

			}


			tunnel.send({
				sid:     session.id,
				tid:     session.tunnels.indexOf(tunnel),
				players: session.players,
				timeout: session.timeout
			}, {
				id: this.id,
				event: 'init'
			});

		}

	};

	const _on_control = function(data) {

		let tunnel = this.tunnel;
		if (tunnel !== null && tunnel.type === 'remote') {

			for (let id in _SESSIONS) {

				let session = _SESSIONS[id];
				let tid     = session.tunnels.indexOf(tunnel);
				if (tid !== -1) {

					if (typeof data.life === 'number') {
						session.lifes[tid] = data.life;
					}

					if (typeof data.direction === 'string') {
						session.directions[tid] = data.direction;
					}

					if (data.position instanceof Object) {
						session.positions[tid].x = data.position.x || 0;
						session.positions[tid].y = data.position.y || 0;
					}


					for (let t = 0, tl = session.tunnels.length; t < tl; t++) {

						let other = session.tunnels[t];
						if (other !== this.tunnel) {

							other.send({
								sid:        session.id,
								tid:        tid,
								players:    session.players,
								directions: session.directions,
								lifes:      session.lifes,
								positions:  session.positions,
								action:     data.action,
								direction:  data.direction
							}, {
								id: this.id,
								event: 'control'
							});

						}

					}

				}

			}

		}

	};

	const _on_unplug = function() {

		let tunnel = this.tunnel;
		if (tunnel !== null && tunnel.type === 'remote') {

			for (let id in _SESSIONS) {

				let session = _SESSIONS[id];
				let index   = session.tunnels.indexOf(tunnel);
				if (index !== -1) {

					session.players.splice(index, 1);
					session.directions.splice(index, 1);
					session.positions.splice(index, 1);
					session.tunnels.splice(index, 1);


					for (let t = 0, tl = session.tunnels.length; t < tl; t++) {

						session.tunnels[t].send({
							sid:     session.id,
							tid:     t,
							players: session.players
						}, {
							id: this.id,
							event: 'update'
						});

					}

				}

			}


			for (let id in _SESSIONS) {

				let session = _SESSIONS[id];
				if (session.tunnels.length === 0) {
					delete _SESSIONS[id];
				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		states.autostart = false;
		states.autolock  = true;
		states.min       = 2;
		states.max       = 6;
		states.sid       = 'wait-for-init';


		_Session.call(this, states);

		states = null;



		/*
		 * INITIALIZATION: CLIENT
		 */

		this.bind('init', function(data) {

			let tunnel = this.tunnel;
			if (tunnel !== null && tunnel.type === 'client') {
				this.setSid(data.sid);
				this.join();
			}

		}, this);



		/*
		 * INITIALIZATION: REMOTE
		 */

		this.bind('plug',    _on_plug,    this);
		this.bind('control', _on_control, this);
		this.bind('unplug',  _on_unplug,  this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Session.prototype.serialize.call(this);
			data['constructor'] = 'game.net.service.Control';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		change: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				return this.send({
					tid:       data.tid,
					life:      data.life,
					action:    null,
					position:  data.position,
					direction: data.direction
				}, {
					event: 'control'
				});

			}


			return false;

		},

		control: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				return this.send({
					tid:       data.tid,
					position:  data.position,
					action:    data.action,
					direction: data.direction
				}, {
					event: 'control'
				});

			}


			return false;

		}

	};


	return Composite;

});

