
lychee.define('lychee.net.remote.Session').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service  = lychee.import('lychee.net.Service');
	const _SESSIONS = {};



	/*
	 * HELPERS
	 */

	const _on_join = function(data) {

		let sid = data.sid || null;
		if (sid !== null) {

			// 1. Create Session
			let session = _SESSIONS[sid] || null;
			if (session === null) {

				let autolock  = data.autolock === false      ? false    : true;
				let autoadmin = data.autoadmin === true      ? true     : false;
				let autostart = data.autostart === false     ? false    : true;
				let min       = typeof data.min === 'number' ? data.min : 2;
				let max       = typeof data.max === 'number' ? data.max : 4;

				session = _SESSIONS[sid] = {
					autolock:  autolock,
					autostart: autostart,
					sid:       sid,
					min:       min,
					max:       max,
					admin:     autoadmin === true ? this.tunnel : null,
					tunnels:   [],
					active:    false
				};


				session.tunnels.push(this.tunnel);
				this.setMulticast(session.tunnels);

				_sync_session.call(this, session);

			// 2. Join Session
			} else {

				let index = session.tunnels.indexOf(this.tunnel);
				if (index === -1) {

					if (session.active === false && session.tunnels.length < session.max) {

						session.tunnels.push(this.tunnel);
						this.setMulticast(session.tunnels);

						_sync_session.call(this, session);

					} else if (session.active === true && session.autolock === false && session.tunnels.length < session.max) {

						session.tunnels.push(this.tunnel);
						this.setMulticast(session.tunnels);

						_sync_session.call(this, session);

					} else if (session.active === true) {

						this.reject('Session is active', {
							sid: sid,
							min: session.min,
							max: session.max
						});

					} else {

						this.reject('Session is full', {
							sid: sid,
							min: session.min,
							max: session.max
						});

					}

				}

			}

		}

	};

	const _on_leave = function(data) {

		let sid = data.sid || null;
		if (sid !== null) {

			// 1. Leave Session
			let session = _SESSIONS[sid] || null;
			if (session !== null) {

				let index = session.tunnels.indexOf(this.tunnel);
				if (index !== -1) {

					session.tunnels.splice(index, 1);

					this.setMulticast([]);

				}


				if (session.tunnels.length === 0) {

					delete _SESSIONS[sid];

				} else {

					_sync_session.call(this, session);

				}

			}

		}

	};

	const _on_start = function(data) {

		let sid = data.sid || null;
		if (sid !== null) {

			let session = _SESSIONS[sid] || null;
			if (session !== null) {

				if (session.admin === null || session.admin === this.tunnel) {

					if (session.active === false) {

						session.autostart = true;

						_sync_session.call(this, session);

					}

				}

			}

		}

	};

	const _on_stop = function(data) {

		let sid = data.sid || null;
		if (sid !== null) {

			let session = _SESSIONS[sid] || null;
			if (session !== null) {

				if (session.active === true) {
					_sync_session.call(this, session);
				}

			}

		}

	};

	const _sync_session = function(session) {

		let sid = session.sid;
		if (sid !== null) {

			let min = session.min;
			let max = session.max;

			let tunnels = [];
			for (let t = 0, tl = session.tunnels.length; t < tl; t++) {
				tunnels.push(session.tunnels[t].host + ':' + session.tunnels[t].port);
			}


			let data = {
				admin:   false,
				type:    'update',
				sid:     sid,
				min:     min,
				max:     max,
				tid:     'localhost:1337',
				tunnels: tunnels
			};


			// 1. Inactive Session
			if (session.active === false) {

				// 1.1 Session Start
				if (session.autostart === true && tunnels.length >= session.min) {

					data.type      = 'start';
					session.active = true;

					if (lychee.debug === true) {
						console.log('lychee.net.remote.Session: Starting session "' + sid + '"');
					}


				// 1.2 Session Update
				} else {

					data.type = 'update';

					if (lychee.debug === true) {
						console.log('lychee.net.remote.Session: Updating session "' + sid + '" (' + session.tunnels.length + ' of ' + session.max + ' tunnels)');
					}

				}


			// 2. Active Session
			} else {

				// 2.1 Session Stop
				if (tunnels.length < session.min) {

					data.type      = 'stop';
					session.active = false;

					if (lychee.debug === true) {
						console.log('lychee.net.remote.Session: Stopping session "' + sid + '"');
					}


				// 2.2 Session Update
				} else {

					data.type = 'update';

					if (lychee.debug === true) {
						console.log('lychee.net.remote.Session: Updating session "' + sid + '" (' + session.tunnels.length + ' of ' + session.max + ' tunnels)');
					}

				}

			}


			for (let st = 0, stl = session.tunnels.length; st < stl; st++) {

				let tunnel = session.tunnels[st];
				if (tunnel !== null) {

					if (session.admin !== null) {
						data.admin = session.admin === tunnel;
					} else {
						data.admin = true;
					}

					data.tid = tunnel.host + ':' + tunnel.port;


					tunnel.send(data, {
						id:    this.id,
						event: 'sync'
					});

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(id, remote, data) {

		id = typeof id === 'string' ? id : 'session';


		_Service.call(this, id, remote, _Service.TYPE.remote);



		/*
		 * INITIALIZATION
		 */

		this.bind('join',  _on_join,  this);
		this.bind('leave', _on_leave, this);
		this.bind('start', _on_start, this);
		this.bind('stop',  _on_stop,  this);


		this.bind('unplug', function() {

			for (let sid in _SESSIONS) {

				let session = _SESSIONS[sid];
				let index   = session.tunnels.indexOf(this.tunnel);
				if (index !== -1) {
					_on_leave.call(this, session);
				}

			}

		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.remote.Session';
			data['arguments']   = [ this.id, null, null ];


			return data;

		}

	};


	return Composite;

});

