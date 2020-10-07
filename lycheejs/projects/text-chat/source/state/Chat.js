
lychee.define('app.state.Chat').requires([
	'lychee.effect.Color',
	'lychee.effect.Offset',
	'lychee.app.sprite.Background',
	'lychee.ui.entity.Button',
	'lychee.ui.entity.Select',
	'lychee.ui.entity.Slider',
	'lychee.ui.entity.Textarea',
	'lychee.ui.sprite.Background',
	'app.ui.entity.Messages',
	'app.ui.sprite.Avatar'
]).includes([
	'lychee.app.State'
]).exports((lychee, global, attachments) => {

	const _Color  = lychee.import('lychee.effect.Color');
	const _Offset = lychee.import('lychee.effect.Offset');
	const _State  = lychee.import('lychee.app.State');
	const _BLOB   = attachments['json'].buffer;
	const _SOUNDS = {
		join_empty: attachments['join_empty.snd'],
		join_full:  attachments['join_full.snd'],
		message:    attachments['message.snd']
	};



	/*
	 * HELPERS
	 */

	const _on_sync = function(room) {

		let background = this.query('bg > background');
		if (background !== null) {

			if (background.effects.length === 0) {

				background.color = '#32afe5';
				background.addEffect(new _Color({
					type:     _Color.TYPE.easeout,
					duration: 300,
					color:    '#405050'
				}));

			}

		}


		let channel = '#home';
		let entity  = this.query('ui > channel');
		if (entity !== null) {
			channel = entity.value;
		}


		if (this.__cache.channel !== channel) {

			this.__cache.channel  = channel;
			this.__cache.messages = [{
				user:    'system',
				message: 'You are now chatting in ' + channel
			}];


			this.loop.setTimeout(100, function() {
				this.query('ui > slider').setValue(100);
			}, this);


			if (room.users.length > 1) {
				this.jukebox.play(_SOUNDS.join_full);
			} else {
				this.jukebox.play(_SOUNDS.join_empty);
			}

		}


		let user_diff = room.users.filter(user => this.__cache.users.includes(user) === false);
		if (user_diff.length > 0) {
			this.__cache.users = room.users;
		}


		for (let m = 0, ml = room.messages.length; m < ml; m++) {

			let user    = room.messages[m].user;
			let message = room.messages[m].message;

			if (user !== null && message !== null) {

				let found = this.__cache.messages.find(m => m.user === user && m.message === message) || null;
				if (found === null) {

					this.__cache.messages.push({
						user:    user,
						message: message
					});

				}

			}

		}


		this.jukebox.play(_SOUNDS.message);


		entity = this.query('ui > messages');
		entity.trigger('relayout');

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(main) {

		_State.call(this, main);


		this.__cache = {
			channel:  '#home',
			users:    [],
			messages: [{
				user:    'system',
				message: 'Welcome to the lychee.js Anonymous Chat.'
			}, {
				user:    'system',
				message: 'Touch on lychee.js Logo to randomize username.'
			}]
		};


		this.deserialize(_BLOB);



		/*
		 * INITIALIZATION
		 */

		let viewport = this.viewport;
		if (viewport !== null) {

			viewport.bind('reshape', function(orientation, rotation) {

				let renderer = this.renderer;
				if (renderer !== null) {

					let entity = null;
					let width  = renderer.width;
					let height = renderer.height;


					entity = this.getLayer('bg');
					entity.width  = width;
					entity.height = height;

					entity = this.query('bg > background');
					entity.width     = width;
					entity.height    = height;
					entity.__isDirty = true;


					entity = this.query('ui > background');
					entity.width      = width;
					entity.position.y = 1 / 2 * height - entity.height / 2;
					entity.__isDirty  = true;

					entity = this.query('ui > channel');
					entity.position.y = 1 / 2 * height - 32 - entity.height / 2;

					entity = this.query('ui > message');
					entity.position.y = 1 / 2 * height - 32 - entity.height / 2;

					entity = this.query('ui > avatar');
					entity.position.y = 1 / 2 * height - 128;

					entity = this.query('ui > button');
					entity.position.y = 1 / 2 * height - 64;

					entity = this.query('ui > messages');
					entity.width      = width;
					entity.height     = height - 192;
					entity.position.y = -192 / 2;
					entity.__isDirty  = true;

					entity = this.query('ui > slider');
					entity.height = height - 192;
					entity.position.x = 1 / 2 * width - entity.width - 16;
					entity.position.y = -192 / 2;
					entity.setValue(entity.value);

				}

			}, this);

		}

	};


	Composite.prototype = {

		/*
		 * STATE API
		 */

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'app.state.Chat';


			return data;

		},

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			let entity = null;


			entity = this.query('ui > channel');
			entity.bind('change', function(value) {

				let service = this.client.getService('chat');
				if (service !== null) {
					service.setRoom(value);
				}

				let slider = this.query('ui > slider');
				if (slider !== null) {
					slider.setValue(100);
					slider.trigger('change', [ slider.value ]);
				}

			}, this);

			entity = this.query('ui > avatar');
			entity.bind('change', function(value) {

				let service = this.client.getService('chat');
				if (service !== null) {
					service.setUser(value);
				}

			}, this);

			entity = this.query('ui > button');
			entity.bind('touch', function() {

				let message = this.query('ui > message');
				let service = this.client.getService('chat');

				if (message !== null && service !== null) {
					message.value.split('\n').forEach(val => service.message(val));
					message.setValue('');
				}

			}, this);

			entity = this.query('ui > messages');
			entity.setAvatar(this.query('ui > avatar'));
			entity.setCache(this.__cache);

			entity = this.query('ui > slider');
			entity.bind('change', function(value) {

				let index = (100 - value) / 100;
				let layer = this.query('ui > messages');

				if (layer !== null) {

					layer.addEffect(new _Offset({
						type:     _Offset.TYPE.easeout,
						duration: 500,
						offset: {
							y: index * (this.__cache.messages.length * 32 - layer.height)
						}
					}));
				}

			}, this);

		},

		update: function(clock, delta) {

			_State.prototype.update.call(this, clock, delta);

		},

		enter: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			let service = this.client.getService('chat');
			if (service !== null) {

				let user = this.query('ui > avatar').value;
				let room = this.query('ui > channel').value;

				service.setUser(user);
				service.setRoom(room);
				service.bind('sync', _on_sync, this);

			}


			return _State.prototype.enter.call(this, oncomplete);

		},

		leave: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			let service = this.client.getService('chat');
			if (service !== null) {
				service.unbind('sync', _on_sync, this);
			}


			return _State.prototype.leave.call(this, oncomplete);

		}

	};


	return Composite;

});
