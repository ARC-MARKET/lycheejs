
lychee.define('lychee.net.service.Session').includes([
	'lychee.net.Service'
]).exports((lychee, global, attachments) => {

	let   _id       = 0;
	const _Service  = lychee.import('lychee.net.Service');
	const _SESSIONS = {};



	/*
	 * HELPERS
	 */

	const _on_join = function(data) {

		let tunnel = this.tunnel;
		if (tunnel !== null && tunnel.type === 'remote') {

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

		}

	};

	const _on_leave = function(data) {

		let tunnel = this.tunnel;
		if (tunnel !== null && tunnel.type === 'remote') {

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

		}

	};

	const _on_start = function(data) {

		let tunnel = this.tunnel;
		if (tunnel !== null && tunnel.type === 'remote') {

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

		}

	};

	const _on_stop = function(data) {

		let tunnel = this.tunnel;
		if (tunnel !== null && tunnel.type === 'remote') {

			let sid = data.sid || null;
			if (sid !== null) {

				let session = _SESSIONS[sid] || null;
				if (session !== null) {

					if (session.active === true) {
						_sync_session.call(this, session);
					}

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
				tunnels.push(session.tunnels[t].id);
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


			if (session.active === false) {

				// 1. Inactive Session

				if (session.autostart === true && tunnels.length >= session.min) {

					// 1.1 Session Start

					data.type      = 'start';
					session.active = true;

					if (lychee.debug === true) {
						console.log('lychee.net.service.Session: Starting session "' + sid + '"');
					}

				} else {

					// 1.2 Session Update

					data.type = 'update';

					if (lychee.debug === true) {
						console.log('lychee.net.service.Session: Updating session "' + sid + '" (' + session.tunnels.length + ' of ' + session.max + ' tunnels)');
					}

				}


			} else {

				// 2. Active Session

				if (tunnels.length < session.min) {

					// 2.1 Session Stop

					data.type      = 'stop';
					session.active = false;

					if (lychee.debug === true) {
						console.log('lychee.net.service.Session: Stopping session "' + sid + '"');
					}

				} else {

					// 2.2 Session Update

					data.type = 'update';

					if (lychee.debug === true) {
						console.log('lychee.net.service.Session: Updating session "' + sid + '" (' + session.tunnels.length + ' of ' + session.max + ' tunnels)');
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

					data.tid = tunnel.id;

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

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.admin     = false;
		this.autoadmin = true;
		this.autolock  = true;
		this.autostart = true;
		this.min       = 2;
		this.max       = 4;
		this.sid       = 'session-' + _id++;


		this.setAutoadmin(states.autoadmin);
		this.setAutolock(states.autolock);
		this.setAutostart(states.autostart);
		this.setMax(states.max);
		this.setMin(states.min);
		this.setSid(states.sid);

		delete states.autoadmin;
		delete states.autolock;
		delete states.autostart;
		delete states.max;
		delete states.min;
		delete states.sid;


		_Service.call(this, states);

		states = null;



		/*
		 * INITIALIZATION: CLIENT
		 */

		this.bind('sync', function(data) {

			let tunnel = this.tunnel;
			if (tunnel !== null && tunnel.type === 'client') {

				let type = data.type;
				if (type === 'update') {

					this.setAdmin(data.admin);
					this.setSid(data.sid);
					this.setMin(data.min);
					this.setMax(data.max);

				}


				if (type === 'update' || type === 'start' || type === 'stop') {

					delete data.type;
					this.trigger(type, [ data ]);

				}

			}

		}, this);



		/*
		 * INITIALIZATION: REMOTE
		 */

		this.bind('unplug', function() {

			let tunnel = this.tunnel;
			if (tunnel !== null && tunnel.type === 'remote') {

				for (let sid in _SESSIONS) {

					let session = _SESSIONS[sid];
					let index   = session.tunnels.indexOf(this.tunnel);
					if (index !== -1) {
						_on_leave.call(this, session);
					}

				}

			}

		}, this);

		this.bind('join',  _on_join,  this);
		this.bind('leave', _on_leave, this);
		this.bind('start', _on_start, this);
		this.bind('stop',  _on_stop,  this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.admin === true) {
				this.setAdmin(true);
			}

		},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.service.Session';

			let states = data['arguments'][0];
			let blob   = (data['blob'] || {});


			if (this.autoadmin !== true)                   states.autoadmin = this.autoadmin;
			if (this.autolock !== true)                    states.autolock  = this.autolock;
			if (this.autostart !== true)                   states.autostart = this.autostart;
			if (this.max !== 4)                            states.max       = this.max;
			if (this.min !== 2)                            states.min       = this.min;
			if (this.sid.startsWith('session-') === false) states.sid       = this.sid;


			if (this.admin !== false) blob.admin = this.admin;


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		join: function() {

			if (this.sid !== null) {

				if (lychee.debug === true) {
					console.log('lychee.net.service.Session: Joining session "' + this.sid + '"');
				}

				return this.send({
					autoadmin: this.autoadmin,
					autolock:  this.autolock,
					autostart: this.autostart,
					sid:       this.sid,
					min:       this.min,
					max:       this.max
				}, {
					event: 'join'
				});

			}


			return false;

		},

		start: function() {

			if (this.sid !== null) {

				return this.send({
					sid: this.sid
				}, {
					event: 'start'
				});

			}


			return false;

		},

		stop: function() {

			if (this.sid !== null) {

				return this.send({
					sid: this.sid
				}, {
					event: 'stop'
				});

			}


			return false;

		},

		leave: function() {

			if (this.sid !== null) {

				if (lychee.debug === true) {
					console.log('lychee.net.service.Session: Leaving session "' + this.sid + '"');
				}

				return this.send({
					sid: this.sid
				}, {
					event: 'leave'
				});

			}


			return false;

		},

		setAdmin: function(admin) {

			admin = typeof admin === 'boolean' ? admin : null;


			if (admin !== null) {

				this.admin = admin;

				return true;

			}


			return false;

		},

		setAutoadmin: function(autoadmin) {

			autoadmin = typeof autoadmin === 'boolean' ? autoadmin : null;


			if (autoadmin !== null) {

				this.autoadmin = autoadmin;

				return true;

			}


			return false;

		},

		setAutolock: function(autolock) {

			autolock = typeof autolock === 'boolean' ? autolock : null;


			if (autolock !== null) {

				this.autolock = autolock;

				return true;

			}


			return false;

		},

		setAutostart: function(autostart) {

			autostart = typeof autostart === 'boolean' ? autostart : null;


			if (autostart !== null) {

				this.autostart = autostart;

				return true;

			}


			return false;

		},

		setMax: function(max) {

			max = typeof max === 'number' ? max : null;


			if (max !== null) {

				this.max = max;

				return true;

			}


			return false;

		},

		setMin: function(min) {

			min = typeof min === 'number' ? min : null;


			if (min !== null) {

				this.min = min;

				return true;

			}


			return false;

		},

		setSid: function(sid) {

			sid = typeof sid === 'string' ? sid : null;


			if (sid !== null) {

				this.sid = sid;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

