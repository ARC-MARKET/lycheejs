
lychee.define('lychee.net.client.Chat').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	var Class = function(id, client, data) {

		id = typeof id === 'string' ? id : 'chat';


		var settings = Object.assign({}, data);


		this.room = null;
		this.user = null;


		lychee.net.Service.call(this, id, client, lychee.net.Service.TYPE.client);



		/*
		 * INITIALIZATION
		 */

		this.setRoom(settings.room);
		this.setUser(settings.user);

		delete settings.room;
		delete settings.user;


		settings = null;

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		sync: function() {

			var user = this.user;
			var room = this.room;
			if (user !== null && room !== null) {

				if (this.tunnel !== null) {

					this.tunnel.send({
						user: user,
						room: room
					}, {
						id:    this.id,
						event: 'sync'
					});

				}

			}

		},

		message: function(message) {

			message = typeof message === 'string' ? message : null;


			if (message !== null) {

				var user = this.user;
				var room = this.room;
				if (user !== null && room !== null) {

					if (this.tunnel !== null) {

						this.tunnel.send({
							message: message,
							user:    user,
							room:    room
						}, {
							id:    this.id,
							event: 'message'
						});

					}

				}

			}

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


	return Class;

});

