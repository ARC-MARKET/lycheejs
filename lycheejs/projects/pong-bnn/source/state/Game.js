
lychee.define('game.state.Game').requires([
	'lychee.ai.bnn.Layer',
	'lychee.effect.Color',
	'lychee.effect.Shake',
	'lychee.ui.entity.Label',
	'game.ai.Agent',
	'game.app.sprite.Ball',
	'game.app.sprite.Paddle',
	'game.ui.sprite.Background'
]).includes([
	'lychee.app.State'
]).exports((lychee, global, attachments) => {

	const _Agent  = lychee.import('game.ai.Agent');
	const _Color  = lychee.import('lychee.effect.Color');
	const _Shake  = lychee.import('lychee.effect.Shake');
	const _State  = lychee.import('lychee.app.State');
	const _BLOB   = attachments['json'].buffer;
	const _SOUNDS = {
		ping: attachments['ping.snd'],
		pong: attachments['pong.snd']
	};



	/*
	 * HELPERS
	 */

	const _reset_game = function(player) {

		player = typeof player === 'string' ? player : null;


		if (player !== null) {

			// XXX: Training must happen BEFORE ball is reset
			let evil_ai = this.query('simulation > ai > evil');
			let good_ai = this.query('simulation > ai > good');

			if (evil_ai !== null && good_ai !== null) {

				if (player === 'evil') {
					evil_ai.reward(10);
					good_ai.punish(10);
				} else if (player === 'good') {
					evil_ai.punish(10);
					good_ai.reward(10);
				}

			}

		}


		let ball = this.query('simulation > game > ball');
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

			if (player === 'evil') {
				stats.generation++;
				stats.evil++;
			} else if (player === 'good') {
				stats.generation++;
				stats.good++;
			}


			let info = this.query('ui > info');
			if (info !== null) {
				info.setValue('(#' + stats.generation + ') ' + stats.good + ' - ' + stats.evil);
			}

		}


		let evil_paddle = this.query('simulation > game > evil');
		if (evil_paddle !== null) {
			evil_paddle.setPosition({ y: 0 });
		}

		let good_paddle = this.query('simulation > game > good');
		if (good_paddle !== null) {
			good_paddle.setPosition({ y: 0 });
		}

	};

	const _bounce_effect = function(player) {

		player = typeof player === 'string' ? player : null;


		let color = '#ffffff';
		if (player === 'good') {
			color = '#14a5e2';
		} else if (player === 'evil') {
			color = '#de1010';
		}


		this.query('simulation > game').addEffect(new _Shake({
			type:     _Shake.TYPE.bounceeaseout,
			duration: 300,
			shake:    {
				x: (Math.random() * 16) | 0,
				y: (Math.random() * 16) | 0
			}
		}));


		let background = this.query('bg > background');
		if (background !== null) {

			background.addEffect(new _Shake({
				type:     _Shake.TYPE.bounceeaseout,
				duration: 300,
				shake:    {
					x: (Math.random() * 16) | 0,
					y: (Math.random() * 16) | 0
				}
			}));

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


		this.__cache = {
			evil: {
				agent:  null,
				paddle: null
			},
			good: {
				agent:  null,
				paddle: null
			}
		};
		this.__statistics = {
			evil:       0,
			good:       0,
			generation: 1
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

				}

			}, this);

		}

	};


	Composite.prototype = {

		/*
		 * STATE API
		 */

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			let renderer = this.renderer;
			let layer    = this.query('simulation > ai');

			if (renderer !== null && layer !== null) {

				layer.unbind('epoche');


				let width  = renderer.width;
				let height = renderer.height;
				let limit  = {
					x: width,
					y: height,
					z: 1
				};


				let ball = this.query('simulation > game > ball');
				let evil = this.query('simulation > game > evil');
				let good = this.query('simulation > game > good');

				if (evil !== null && ball !== null) {

					let agent = new _Agent({
						limit:  limit,
						ball:   ball,
						paddle: evil
					});

					layer.setAgent('evil', agent);
					this.__cache.evil.agent  = agent;
					this.__cache.evil.paddle = evil;

				}

				if (good !== null && ball !== null) {

					let agent = new _Agent({
						limit:  limit,
						ball:   ball,
						paddle: good
					});

					layer.setAgent('good', agent);
					this.__cache.good.agent  = agent;
					this.__cache.good.paddle = good;

				}

			}

		},

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'game.state.Game';


			return data;

		},

		enter: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			let stats = this.__statistics || null;
			if (stats !== null) {

				stats.good       = 0;
				stats.evil       = 0;
				stats.generation = 1;

			}


			_reset_game.call(this, null);


			return _State.prototype.enter.call(this, oncomplete);

		},

		leave: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			return _State.prototype.leave.call(this, oncomplete);

		},

		update: function(clock, delta) {

			_State.prototype.update.call(this, clock, delta);


			let jukebox  = this.jukebox;
			let game     = this.query('simulation > game');
			let ball     = game.query('ball');
			let evil     = game.query('evil');
			let good     = game.query('good');
			let hwidth   = game.width  / 2;
			let hheight  = game.height / 2;
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

		}

	};


	return Composite;

});
