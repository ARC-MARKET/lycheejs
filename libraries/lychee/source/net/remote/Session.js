
lychee.define('lychee.net.remote.Session').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _CACHE = {};

	var _on_join = function(data) {

		var sid = data.sid || null;
		if (sid !== null) {

			// 1. Create Session
			var session = _CACHE[sid] || null;
			if (session === null) {

				var autoadmin = data.autoadmin === true      ? true     : false;
				var autolock  = data.autolock === false      ? false    : true;
				var autostart = data.autostart === false     ? false    : true;
				var min       = typeof data.min === 'number' ? data.min : 2;
				var max       = typeof data.max === 'number' ? data.max : 4;

				session = _CACHE[sid] = {
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

				var index = session.tunnels.indexOf(this.tunnel);
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

	var _on_leave = function(data) {

		var sid = data.sid || null;
		if (sid !== null) {

			// 1. Leave Session
			var session = _CACHE[sid] || null;
			if (session !== null) {

				var index = session.tunnels.indexOf(this.tunnel);
				if (index !== -1) {

					session.tunnels.splice(index, 1);

					this.setSession(null);
					this.setMulticast([]);

				}


				if (session.tunnels.length === 0) {

					delete _CACHE[sid];

				} else {

					_sync_session.call(this, session);

				}

			}

		}

	};

	var _on_start = function(data) {

		var sid = data.sid || null;
		if (sid !== null) {

			var session = _CACHE[sid] || null;
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

	var _on_stop = function(data) {

		var sid = data.sid || null;
		if (sid !== null) {

			var session = _CACHE[sid] || null;
			if (session !== null) {

				if (session.active === true) {
					_sync_session.call(this, session);
				}

			}

		}

	};

	var _sync_session = function(session) {

		var sid = session.sid;
		if (sid !== null) {

			var min = session.min;
			var max = session.max;

			var tunnels = [];
			for (var t = 0, tl = session.tunnels.length; t < tl; t++) {
				tunnels.push(session.tunnels[t].host + ':' + session.tunnels[t].port);
			}


			var data = {
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


			this.setSession(session);


			for (var st = 0, stl = session.tunnels.length; st < stl; st++) {

				var tunnel = session.tunnels[st];
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

	var Composite = function(id, remote, data) {

		id = typeof id === 'string' ? id : 'session';


		var settings = Object.assign({}, data);


		this.session = null;


		lychee.net.Service.call(this, id, remote, lychee.net.Service.TYPE.remote);



		/*
		 * INITIALIZATION
		 */

		this.bind('join',  _on_join,  this);
		this.bind('leave', _on_leave, this);
		this.bind('start', _on_start, this);
		this.bind('stop',  _on_stop,  this);


		this.bind('unplug', function() {

			for (var sid in _CACHE) {

				var session = _CACHE[sid];
				var index   = session.tunnels.indexOf(this.tunnel);
				if (index !== -1) {
					_on_leave.call(this, session);
				}

			}

		}, this);


		settings = null;

	};


	Composite.prototype = {

		/*
		 * CUSTOM API
		 */

		setSession: function(session) {

			if (session === null || (session instanceof Object && session.sid !== null)) {

				this.session = session;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

