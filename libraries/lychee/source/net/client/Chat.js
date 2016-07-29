
lychee.define('lychee.net.client.Chat').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(id, client, data) {

		id = typeof id === 'string' ? id : 'chat';


		let settings = Object.assign({}, data);


		this.room = null;
		this.user = null;


		_Service.call(this, id, client, _Service.TYPE.client);



		/*
		 * INITIALIZATION
		 */

		this.setRoom(settings.room);
		this.setUser(settings.user);

		delete settings.room;
		delete settings.user;


		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.client.Chat';

			let settings = {};


			if (this.room !== null) settings.room = this.room;
			if (this.user !== null) settings.user = this.user;


			data['arguments'][2] = settings;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		sync: function() {

			let user = this.user;
			let room = this.room;
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

				let user = this.user;
				let room = this.room;
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


	return Composite;

});

