
lychee.define('lychee.net.remote.Chat').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');
	const _CHATS   = {};



	/*
	 * HELPERS
	 */

	const _on_disconnect = function() {

		for (let rId in _CHATS) {

			let index = _CHATS[rId].tunnels.indexOf(this.tunnel);
			if (index !== -1) {
				_CHATS[rId].users.splice(index, 1);
				_CHATS[rId].tunnels.splice(index, 1);
				_sync_chat.call(this, _CHATS[rId]);
			}

		}

	};

	const _on_sync = function(data) {

		let user = data.user || null;
		let room = data.room || null;
		if (user !== null && room !== null) {


			let sync = false;


			// 1. Create Room
			let chat = _CHATS[room] || null;
			if (chat === null) {

				chat = _CHATS[room] = {
					messages: [],
					users:    [ user ],
					tunnels:  [ this.tunnel ]
				};

			// 2. Join Room
			} else {

				let tid = chat.tunnels.indexOf(this.tunnel);
				if (tid === -1) {
					chat.tunnels.push(this.tunnel);
					chat.users.push(user);
				} else {
					chat.users[tid] = user;
				}


				_sync_chat.call(this, chat);

			}


			// 3. Leave Room (only one at a time allowed)
			for (let rId in _CHATS) {

				if (rId === room) continue;

				let index = _CHATS[rId].tunnels.indexOf(this.tunnel);
				if (index !== -1) {

					_CHATS[rId].users.splice(index, 1);
					_CHATS[rId].tunnels.splice(index, 1);

					_sync_chat.call(this, _CHATS[rId]);

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

	let Composite = function(id, remote, data) {

		id = typeof id === 'string' ? id : 'chat';


		let settings = Object.assign({}, data);


		this.limit = 128;


		this.setLimit(settings.limit);

		delete settings.limit;


		_Service.call(this, id, remote, _Service.TYPE.remote);



		/*
		 * INITIALIZATION
		 */

		this.bind('sync',    _on_sync,    this);
		this.bind('message', _on_message, this);

		this.tunnel.bind('disconnect', _on_disconnect, this);


		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.remote.Chat';

			let settings = {};
			let blob     = (data['blob'] || {});


			if (this.limit !== 128) settings.limit = this.limit;


			data['arguments'] = [ this.id, null, settings ];
			data['blob']      = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setLimit: function(limit) {

			limit = typeof limit === 'number' ? limit : null;


			if (limit !== null) {

				this.limit = limit;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

