
lychee.define('game.state.Game').requires([
	'game.app.entity.Cell',
	'game.app.entity.Unit',
	'game.app.entity.Vesicle',
	'game.logic.Pathfinder',
	'lychee.app.Layer',
	'lychee.ui.Layer'
]).includes([
	'lychee.app.State'
]).exports((lychee, global, attachments) => {

	const _Pathfinder = lychee.import('game.logic.Pathfinder');
	const _State      = lychee.import('lychee.app.State');
	const _BLOB       = attachments['json'].buffer;
	const _LEVELS     = attachments['levels.json'].buffer;



	/*
	 * HELPERS
	 */

	const _on_touch = function(id, position, delta) {

		let game   = this.getLayer('game');
		let entity = game.getEntity(null, position);
		if (entity !== null) {
			// TODO: Touched an Entity
			console.log('Touched entity', entity);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(main) {

		_State.call(this, main);


		this.__map = {};


		this.deserialize(_BLOB);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);

		},

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'game.state.Game';


			return data;

		},



		/*
		 * STATE API
		 */

		render: function(clock, delta) {


			let renderer = this.renderer;
			if (renderer !== null) {

				renderer.clear();

				_State.prototype.render.call(this, clock, delta, true);


				let map = this.__map;

				for (let origin in map.paths) {

					let targets = map.paths[origin];
					if (targets.length > 0) {

						for (let t = 0, tl = targets.length; t < tl; t++) {

							let target = targets[t];

							let position_origin = map.vesicles[origin].position || null;
							let position_target = map.vesicles[target].position || null;

							if (position_origin !== null && position_target !== null) {

								renderer.drawLine(
									renderer.width  / 2 + position_origin.x,
									renderer.height / 2 + position_origin.y,
									renderer.width  / 2 + position_target.x,
									renderer.height / 2 + position_target.y,
									'#ff0000',
									1
								);

							}

						}

					}

				}

				renderer.flush();

			}

		},

		enter: function(oncomplete, data) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;
			data       = typeof data === 'string'       ? data       : 'immune-01';


			let layer = this.getLayer('ui');
			if (layer !== null) {
				layer.bind('touch', _on_touch, this);
			}


			let level = _LEVELS[data] || null;
			if (level !== null) {

				let entities = level.map(value => lychee.deserialize(value));
				if (entities.length > 0) {
					this.__map = _Pathfinder.generate(entities);
				}

				let game = this.getLayer('game');
				if (game !== null) {
					game.setEntities(entities);
				}

			}


			return _State.prototype.enter.call(this, oncomplete);

		},

		leave: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			let layer = this.getLayer('ui');
			if (layer !== null) {
				layer.unbind('touch', _on_touch, this);
			}

			let game = this.getLayer('game');
			if (game !== null) {
				game.removeEntities();
			}


			return _State.prototype.leave.call(this, oncomplete);

		}

	};


	return Composite;

});

