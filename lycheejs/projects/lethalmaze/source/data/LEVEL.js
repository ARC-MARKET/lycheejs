
lychee.define('game.data.LEVEL').requires([
	'game.app.sprite.Item',
	'game.app.sprite.Tank',
	'game.app.sprite.Terrain',
	'game.app.sprite.Wall'
]).exports((lychee, global, attachments) => {

	const _Item    = lychee.import('game.app.sprite.Item');
	const _Tank    = lychee.import('game.app.sprite.Tank');
	const _Terrain = lychee.import('game.app.sprite.Terrain');
	const _Wall    = lychee.import('game.app.sprite.Wall');
	const _TILE    = 32;



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'game.data.LEVEL',
				'blob':      null
			};

		},

		encode: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				let dim_x = 0;
				let dim_y = 0;


				if (data.terrain instanceof Array) {

					data.terrain.forEach(entity => {

						let x = (entity.position.x / _TILE) | 0;
						let y = (entity.position.y / _TILE) | 0;

						dim_x = Math.max(dim_x, x);
						dim_y = Math.max(dim_y, y);

					});

				}


				let blob = new Array(dim_y);
				for (let b = 0, bl = blob.length; b < bl; b++) {
					blob[b] = new Array(dim_x).fill(0);
				}


				if (data.objects instanceof Array) {

					data.objects.forEach(entity => {

						let x = (entity.position.x / _TILE) | 0;
						let y = (entity.position.y / _TILE) | 0;

						let type = 0;
						if (entity instanceof _Wall) {
							type = 1;
						} else if (entity instanceof _Tank) {
							type = 2;
						} else if (entity instanceof _Item) {
							type = 3;
						}


						blob[y][x] = type;

					});

				}


				return blob;

			}


			return null;

		},

		decode: function(data) {

			data = data instanceof Array ? data : null;


			if (data !== null) {

				let cache = {
					terrain: [],
					objects: []
				};


				data.forEach((line, y) => {

					line.forEach((type, x) => {

						let position = {
							x: x + 0.5,
							y: y + 0.5
						};


						position.x = position.x * _TILE;
						position.y = position.y * _TILE;


						cache.terrain.push(new _Terrain({
							position: position
						}));


						switch (type) {

							case 1:

								cache.objects.push(new _Wall({
									position: position
								}));

								break;

							case 2:

								cache.objects.push(new _Tank({
									position: position
								}));

								break;

							case 3:

								cache.objects.push(new _Item({
									position: position
								}));

								break;

						}

					});

				});


				return cache;

			}


			return null;

		}

	};


	return Module;

});

