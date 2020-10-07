
lychee.define('game.state.Game').requires([
	'lychee.effect.Color',
	'lychee.effect.Shake',
	'lychee.ui.entity.Label',
	'game.app.sprite.Ball',
	'game.app.sprite.Paddle',
	'game.ui.sprite.Background',
	'game.ui.sprite.Welcome'
]).includes([
	'lychee.app.State'
]).exports((lychee, global, attachments) => {

	const _Color  = lychee.import('lychee.effect.Color');
	const _Shake  = lychee.import('lychee.effect.Shake');
	const _State  = lychee.import('lychee.app.State');
	const _BLOB   = attachments['json'].buffer;
	const _MUSIC  = attachments['music.msc'];
	const _SOUNDS = {
		boo:   attachments['boo.snd'],
		cheer: attachments['cheer.snd'],
		ping:  attachments['ping.snd'],
		pong:  attachments['pong.snd']
	};



	/*
	 * HELPERS
	 */

	const _on_touch = function(id, position, delta) {

		let renderer = this.renderer;
		if (renderer !== null) {

			position.y -= renderer.offset.y;
			position.y -= renderer.height / 2;

		}


		this.__good.target.y = position.y;

	};

	const _reset_game = function(player) {

		player = typeof player === 'string' ? player : null;


		let ball = this.query('game > ball');
		if (ball !== null) {

			let position = {
				x: 0,
				y: 0
			};

			let velocity = {
				x: 300,
				y: 150 + Math.random() * 300
			};

			if (Math.random() > 0.5) {
				velocity.y *= -1;
			}

			if (player === 'good') {
				velocity.x *= -1;
			}

			ball.setPosition(position);
			ball.setVelocity(velocity);

		}


		let stats = this.__statistics || null;
		if (stats !== null) {

			if (player === 'good') {
				stats.good++;
				this.jukebox.play(_SOUNDS.cheer);
			} else if (player === 'evil') {
				stats.evil++;
				this.jukebox.play(_SOUNDS.boo);
			}

			let info = this.query('ui > info');
			if (info !== null) {
				info.setValue(stats.good + ' - ' + stats.evil);
			}

		}


		this.query('game > good').setPosition({ y: 0 });
		this.query('game > evil').setPosition({ y: 0 });

	};

	const _bounce_effect = function(player) {

		player = typeof player === 'string' ? player : null;


		let color = '#ffffff';
		if (player === 'good') {
			color = '#14a5e2';
		} else if (player === 'evil') {
			color = '#de1010';
		}


		this.getLayer('game').addEffect(new _Shake({
			type:     _Shake.TYPE.bounceeaseout,
			duration: 300,
			shake:    {
				x: (Math.random() * 16) | 0,
				y: (Math.random() * 16) | 0
			}
		}));

		this.getLayer('ui').addEffect(new _Shake({
			type:     _Shake.TYPE.bounceeaseout,
			duration: 300,
			shake:    {
				x: (Math.random() * 16) | 0,
				y: (Math.random() * 16) | 0
			}
		}));


		let background = this.query('bg > background');
		if (background !== null) {

			background.setColor(color);
			background.addEffect(new _Color({
				type:     _Color.TYPE.easeout,
				duration: 1000,
				color:    '#050a0d'
			}));

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(main) {

		_State.call(this, main);


		this.__evil = {
			clock:  null,
			delta:  500,
			target: { y: 0 }
		};

		this.__good = {
			target: { y: 0 }
		};

		this.__statistics = {
			good: 0,
			evil: 0
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


					entity = this.query('bg > background');
					entity.trigger('reshape', [ null, null, width, height ]);

					entity = this.query('ui > info');
					entity.setPosition({
						x: 0,
						y: -1 / 2 * height + 42
					});

					entity = this.query('game > good');
					entity.setPosition({ x: -1 / 2 * width + 42 });

					entity = this.query('game > evil');
					entity.setPosition({ x:  1 / 2 * width - 42 });

				}

			}, this);

		}

	};


	Composite.prototype = {

		/*
		 * STATE API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'game.state.Game';


			return data;

		},

		enter: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			let stats = this.__statistics || null;
			if (stats !== null) {

				stats.good = 0;
				stats.evil = 0;
				this.__evil.target.y = 0;

			}


			_reset_game.call(this, null);


			// Allow AI playing while welcome dialog is visible

			let welcome = this.query('ui > welcome');
			if (welcome !== null) {

				welcome.setVisible(true);
				welcome.bind('#touch', function(entity) {

					stats.good = 0;
					stats.evil = 0;
					this.__evil.target.y = 0;


					_reset_game.call(this, null);

					entity.setVisible(false);

					this.input.bind('touch', _on_touch, this);

				}, this, true);

			}


			let jukebox = this.jukebox;
			if (jukebox !== null) {
				jukebox.play(_MUSIC);
			}


			return _State.prototype.enter.call(this, oncomplete);

		},

		leave: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			this.input.unbind('touch', _on_touch, this);


			let jukebox = this.jukebox;
			if (jukebox !== null) {
				jukebox.stop(_MUSIC);
			}


			return _State.prototype.leave.call(this, oncomplete);

		},

		update: function(clock, delta) {

			_State.prototype.update.call(this, clock, delta);


			let jukebox  = this.jukebox;
			let renderer = this.renderer;

			let ball     = this.query('game > ball');
			let evil     = this.query('game > evil');
			let good     = this.query('game > good');
			let hwidth   = renderer.width / 2;
			let hheight  = renderer.height / 2;
			let position = ball.position;
			let velocity = ball.velocity;


			/*
			 * 1: WORLD BOUNDARIES
			 */

			if (position.y > hheight && velocity.y > 0) {
				position.y = hheight - 1;
				velocity.y = -1 * velocity.y;
			}

			if (position.y < -hheight && velocity.y < 0) {
				position.y = -hheight + 1;
				velocity.y = -1 * velocity.y;
			}

			if (good.position.y < -hheight + 52) {
				good.position.y = -hheight + 52;
				good.velocity.y = 0;
			} else if (good.position.y > hheight - 52) {
				good.position.y = hheight - 52;
				good.velocity.y = 0;
			}

			if (evil.position.y < -hheight + 52) {
				evil.position.y = -hheight + 52;
				evil.velocity.y = 0;
			} else if (evil.position.y > hheight - 52) {
				evil.position.y = hheight - 52;
				evil.velocity.y = 0;
			}



			/*
			 * 2: GAME RESET
			 */

			if (position.x > hwidth) {

				_reset_game.call(this, 'good');
				return;

			} else if (position.x < -hwidth) {

				_reset_game.call(this, 'evil');
				return;

			}



			/*
			 * 3: COLLISIONS
			 */

			if (ball.collides(good) === true) {

				position.x = good.position.x + 24;
				velocity.x = Math.abs(velocity.x);
				jukebox.play(_SOUNDS.ping);

				_bounce_effect.call(this, 'good');

			} else if (ball.collides(evil) === true) {

				position.x = evil.position.x - 24;
				velocity.x = -1 * Math.abs(velocity.x);
				jukebox.play(_SOUNDS.pong);

				_bounce_effect.call(this, 'evil');

			}



			/*
			 * 4: CONTROLS
			 */

			let c_evil = this.__evil;
			let c_good = this.__good;

			if (c_evil.clock === null) {
				c_evil.clock = clock;
			}

			if ((clock - c_evil.clock) > c_evil.delta) {

				c_evil.target.y = position.y;
				c_evil.clock    = clock;

				evil.moveTo(c_evil.target);

			}

			if (c_good.target.y !== good.position.y) {
				good.moveTo(c_good.target);
			}

		}

	};


	return Composite;

});
