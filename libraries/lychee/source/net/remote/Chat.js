
lychee.define('lychee.net.remote.Chat').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _CACHE = {};

	var _on_disconnect = function() {

		for (var rId in _CACHE) {

			var index = _CACHE[rId].tunnels.indexOf(this.tunnel);
			if (index !== -1) {
				_CACHE[rId].users.splice(index, 1);
				_CACHE[rId].tunnels.splice(index, 1);
				_sync_room.call(this, _CACHE[rId]);
			}

		}

	};

	var _on_sync = function(data) {

		var user = data.user || null;
		var room = data.room || null;
		if (user !== null && room !== null) {


			var sync = false;


			// 1. Create Room
			var cache = _CACHE[room] || null;
			if (cache === null) {

				cache = _CACHE[room] = {
					messages: [],
					users:    [ user ],
					tunnels:  [ this.tunnel ]
				};

			// 2. Join Room
			} else {

				var tid = cache.tunnels.indexOf(this.tunnel);
				if (tid === -1) {
					cache.tunnels.push(this.tunnel);
					cache.users.push(user);
				} else {
					cache.users[tid] = user;
				}


				_sync_room.call(this, cache);

			}


			// 3. Leave Room (only one at a time allowed)
			for (var rId in _CACHE) {

				if (rId === room) continue;

				var index = _CACHE[rId].tunnels.indexOf(this.tunnel);
				if (index !== -1) {

					_CACHE[rId].users.splice(index, 1);
					_CACHE[rId].tunnels.splice(index, 1);

					_sync_room.call(this, _CACHE[rId]);

				}

			}

		}

	};

	var _on_message = function(data) {

		var user    = data.user    || null;
		var room    = data.room    || null;
		var message = data.message || null;
		if (user !== null && room !== null && message !== null) {

			var cache = _CACHE[room] || null;
			if (cache !== null) {

				var limit = this.limit;
				if (cache.messages.length > limit - 1) {
					cache.messages.splice(0, 1);
				}

				cache.messages.push({
					user:    user,
					message: message
				});


				_sync_room.call(this, cache);

			}

		}

	};

	var _sync_room = function(room) {

		var data = {
			messages: room.messages,
			users:    room.users
		};


		for (var t = 0, tl = room.tunnels.length; t < tl; t++) {

			var tunnel = room.tunnels[t];
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

	var Class = function(id, remote, data) {

		id = typeof id === 'string' ? id : 'chat';


		var settings = lychee.extend({}, data);


		this.limit = 128;


		this.setLimit(settings.limit);

		delete settings.limit;


		lychee.net.Service.call(this, id, remote, lychee.net.Service.TYPE.remote);



		/*
		 * INITIALIZATION
		 */

		this.bind('sync',    _on_sync,    this);
		this.bind('message', _on_message, this);

		this.tunnel.bind('disconnect', _on_disconnect, this);


		settings = null;

	};


	Class.prototype = {

		setLimit: function(limit) {

			limit = typeof limit === 'number' ? limit : null;


			if (limit !== null) {

				this.limit = limit;

				return true;

			}


			return false;

		}

	};


	return Class;

});

