
lychee.define('game.state.Game').requires([
	'lychee.math.Mersenne',
	'lychee.ui.entity.Label',
	'game.app.sprite.Goal',
	'game.app.sprite.Plane',
	'game.effect.Explosion',
	'game.ui.sprite.Background'
]).includes([
	'lychee.app.State'
]).exports((lychee, global, attachments) => {

	const _Explosion = lychee.import('game.effect.Explosion');
	const _Goal      = lychee.import('game.app.sprite.Goal');
	const _Mersenne  = lychee.import('lychee.math.Mersenne');
	const _Plane     = lychee.import('game.app.sprite.Plane');
	const _State     = lychee.import('lychee.app.State');
	const _BLOB      = attachments['json'].buffer;



	/*
	 * HELPERS
	 */

	const _on_touch = function(id, position, delta) {

		let plane = this.__cache.planes[0] || null;
		if (plane !== null) {
			plane.flap();
		}

	};

	const _get_next_goal = function(plane) {

		let distance = Infinity;
		let found    = null;
		let goals    = this.__cache.goals;
		let px       = plane.position.x;
		let py       = plane.position.y;

		for (let g = 0, gl = goals.length; g < gl; g++) {

			let goal = goals[g];
			let gx   = goal.position.x;
			let gy   = goal.position.y;

			let dist = Math.sqrt(Math.pow(gx - px, 2) + Math.pow(gy - py, 2));
			if (dist < distance) {
				found    = goal;
				distance = dist;
			}

		}

		return found;

	};

	const _reset_game = function() {

		let stats = this.__statistics;


		stats.generation++;
		stats.highscore = Math.max(stats.highscore, stats.score);
		stats.score     = 0;


		this.twister = new _Mersenne({
			seed: 1337
		});


		_reset_goals.call(this, true);
		_reset_planes.call(this, true);

	};

	const _reset_goals = function(complete) {

		complete = complete === true;


		let goals   = this.__cache.goals;
		let twister = this.twister;
		let width   = this.renderer.width;
		let height  = this.renderer.height;

		let offsetx =  1 / 2 * width;
		let offsety = -1 / 2 * height + 128;

		if (complete === true) {

			for (let g = 0, gl = goals.length; g < gl; g++) {
				goals[g].position.x = -4096;
			}

		}

		for (let g = 0, gl = goals.length; g < gl; g++) {
			offsetx = Math.max(offsetx, goals[g].position.x);
		}


		for (let g = 0, gl = goals.length; g < gl; g++) {

			let goal = goals[g];
			if (goal.position.x < -1 / 2 * width) {
				goal.position.x = offsetx;
				goal.position.y = offsety + (twister.random() * (height - 256)) | 0;
				offsetx += 256;
			}

		}

	};

	const _reset_planes = function(complete) {

		complete = complete === true;


		let planes = this.__cache.planes;
		let width  = this.renderer.width;

		if (complete === true) {

			for (let p = 0, pl = planes.length; p < pl; p++) {

				let plane = planes[p];

				plane.position.x = -1 / 2 * width + plane.width;
				plane.position.y = 0;
				plane.velocity.y = 0;
				plane.alive      = true;
				plane.__canflap  = true;

			}

		}

	};


	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(main) {

		_State.call(this, main);


		this.twister = new _Mersenne({
			seed: 1337
		});


		this.__cache = {
			background: null,
			goals:      [],
			info:       null,
			planes:     []
		};

		this.__statistics = {
			generation: 1,
			score:      0,
			highscore:  0
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
					this.__cache.background = entity;

					entity = this.query('ui > info');
					entity.setPosition({
						y: -1 / 2 * height + 32
					});
					this.__cache.info = entity;

				}

			}, this);

		}

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'game.state.Game';


			return data;

		},

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			let cache    = this.__cache;
			let renderer = this.renderer;
			let layer    = this.getLayer('game');

			if (renderer !== null && layer !== null) {

				let plane = new _Plane();

				layer.addEntity(plane);
				cache.planes.push(plane);

				_reset_planes.call(this);


				for (let g = 0; g < (renderer.width / 256); g++) {
					let goal = new _Goal();
					cache.goals.push(goal);
					layer.addEntity(goal);
				}

				_reset_goals.call(this);

			}

		},



		/*
		 * CUSTOM API
		 */

		enter: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			_reset_game.call(this);


			let input = this.input;
			if (input !== null) {
				input.bind('touch', _on_touch, this);
			}


			if (oncomplete !== null) {
				oncomplete(true);
			}


			return true;

		},

		leave: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			let input = this.input;
			if (input !== null) {
				input.unbind('touch', _on_touch, this);
			}


			if (oncomplete !== null) {
				oncomplete(true);
			}


			return true;

		},

		update: function(clock, delta) {

			for (let id in this.__layers) {

				if (id === 'ai') continue;

				let layer = this.__layers[id];
				if (layer.visible === false) continue;

				layer.update(clock, delta);

			}


			let cache  = this.__cache;
			let stats  = this.__statistics;
			let width  = this.renderer.width;
			let height = this.renderer.height;


			let background = cache.background;
			if (background !== null) {

				let origin = background.origin.x - (delta / 1000) * 128;
				background.origin.x  = (origin % background.width) | 0;
				background.__isDirty = true;

			}


			let is_alive = false;
			let goals    = cache.goals;
			let planes   = cache.planes;

			let next_goal = _get_next_goal.call(this, planes[0]);
			if (next_goal !== null) {

				for (let p = 0, pl = planes.length; p < pl; p++) {

					let plane = planes[p];
					if (plane.alive === true) {

						if (plane.position.y > 1 / 2 * height || next_goal.collides(plane) === true) {

							if (plane.effects.length === 0) {
								plane.addEffect(new _Explosion({
									position: plane.position
								}));
							}

							plane.alive = false;

						}

					}

					if (plane.alive === true) {
						is_alive = true;
					}

				}

			}


			if (is_alive === true) {

				stats.score += ((delta / 1000) * 256) | 0;


				let info = this.__cache.info;
				if (info !== null) {
					info.setValue('Generation ' + stats.generation + ' - Score ' + stats.score);
				}

				for (let g = 0, gl = goals.length; g < gl; g++) {

					if (goals[g].position.x < -1 / 2 * width) {
						_reset_goals.call(this);
						break;
					}

				}

			} else {

				_reset_game.call(this);

			}

		}

	};


	return Composite;

});
