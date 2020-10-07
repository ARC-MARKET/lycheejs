
lychee.define('lychee.net.service.Chat').includes([
	'lychee.net.Service'
]).exports((lychee, global, attachments) => {

	const _Service = lychee.import('lychee.net.Service');
	const _CHATS   = {};



	/*
	 * HELPERS
	 */

	const _on_disconnect = function() {

		let tunnel = this.tunnel;
		if (tunnel !== null && tunnel.type === 'remote') {

			for (let cid in _CHATS) {

				let other = _CHATS[cid];
				let index = other.tunnels.indexOf(tunnel);
				if (index !== -1) {

					other.users.splice(index, 1);
					other.tunnels.splice(index, 1);

					_sync_chat.call(this, other);

				}

			}

		}

	};

	const _on_sync = function(data) {

		let tunnel = this.tunnel;
		if (tunnel !== null && tunnel.type === 'remote') {

			let user = data.user || null;
			let room = data.room || null;

			if (user !== null && room !== null) {

				let chat = _CHATS[room] || null;
				if (chat === null) {

					// 1. Create Room

					chat = _CHATS[room] = {
						messages: [],
						users:    [ user ],
						tunnels:  [ tunnel ]
					};

				} else {

					// 2. Join Room

					let tid = chat.tunnels.indexOf(tunnel);
					if (tid === -1) {
						chat.tunnels.push(tunnel);
						chat.users.push(user);
					} else {
						chat.users[tid] = user;
					}


					_sync_chat.call(this, chat);

				}


				// 3. Leave Room (only one at a time allowed)
				for (let cid in _CHATS) {

					let other = _CHATS[cid];
					if (other !== room) {

						let index = other.tunnels.indexOf(tunnel);
						if (index !== -1) {

							other.users.splice(index, 1);
							other.tunnels.splice(index, 1);

							_sync_chat.call(this, other);

						}

					}

				}

			}

		}

	};

	const _on_message = function(data) {

		let user    = data.user    || null;
		let room    = data.room    || null;
		let message = data.message || null;

		if (user !== null && room !== null && message !== null) {

			let chat = _CHATS[room] || null;
			if (chat !== null) {

				let limit = this.limit;
				if (chat.messages.length > limit - 1) {
					chat.messages.splice(0, 1);
				}

				chat.messages.push({
					user:    user,
					message: message
				});

				_sync_chat.call(this, chat);

			}

		}

	};

	const _sync_chat = function(chat) {

		let data = {
			messages: chat.messages,
			users:    chat.users
		};


		for (let t = 0, tl = chat.tunnels.length; t < tl; t++) {

			let tunnel = chat.tunnels[t];
			if (tunnel !== null) {

				tunnel.send(data, {
					id:    this.id,
					event: 'sync'
				});

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.room  = null;
		this.user  = null;
		this.limit = 128;


		this.setLimit(states.limit);
		this.setRoom(states.room);
		this.setUser(states.user);

		delete states.limit;
		delete states.room;
		delete states.user;


		_Service.call(this, states);

		states = null;



		/*
		 * INITIALIZATION: REMOTE
		 */

		this.bind('sync',    _on_sync,    this);
		this.bind('message', _on_message, this);

		this.tunnel.bind('disconnect', _on_disconnect, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.service.Chat';

			let states = data['arguments'][0];
			let blob   = (data['blob'] || {});


			if (this.limit !== 128) states.limit = this.limit;
			if (this.room !== null) states.room  = this.room;
			if (this.user !== null) states.user  = this.user;


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		message: function(message) {

			message = typeof message === 'string' ? message : null;


			if (message !== null) {

				let user = this.user;
				let room = this.room;

				if (user !== null && room !== null) {

					return this.send({
						message: message,
						user:    user,
						room:    room
					}, {
						event: 'message'
					});

				}

			}


			return false;

		},

		sync: function() {

			let user = this.user;
			let room = this.room;

			if (user !== null && room !== null) {

				return this.send({
					user: user,
					room: room
				}, {
					event: 'sync'
				});

			}


			return false;

		},

		setLimit: function(limit) {

			limit = typeof limit === 'number' ? limit : null;


			if (limit !== null) {

				this.limit = limit;

				return true;

			}


			return false;

		},

		setRoom: function(room) {

			room = typeof room === 'string' ? room : null;


			if (room !== null) {

				this.room = room;
				this.sync();

				return true;

			}


			return false;

		},

		setUser: function(user) {

			user = typeof user === 'string' ? user : null;


			if (user !== null) {

				this.user = user;
				this.sync();

				return true;

			}


			return false;

		}

	};


	return Composite;

});

