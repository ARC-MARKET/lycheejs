
lychee.define('game.data.LEVEL').requires([
	'game.app.sprite.Item',
	'game.app.sprite.Tank',
	'game.app.sprite.Terrain',
	'game.app.sprite.Wall'
]).exports(function(lychee, global, attachments) {

	var _Item    = lychee.import('game.app.sprite.Item');
	var _Tank    = lychee.import('game.app.sprite.Tank');
	var _Terrain = lychee.import('game.app.sprite.Terrain');
	var _Wall    = lychee.import('game.app.sprite.Wall');
	var _TILE    = 32;



	/*
	 * IMPLEMENTATION
	 */

	var Module = {

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

				var dim_x = 0;
				var dim_y = 0;


				if (data.terrain instanceof Array) {

					data.terrain.forEach(function(entity) {

						var x = (entity.position.x / _TILE) | 0;
						var y = (entity.position.y / _TILE) | 0;

						dim_x = Math.max(dim_x, x);
						dim_y = Math.max(dim_y, y);

					});

				}


				var blob = new Array(dim_y);
				for (var b = 0, bl = blob.length; b < bl; b++) {
					blob[b] = new Array(dim_x).fill(0);
				}


				if (data.objects instanceof Array) {

					data.objects.forEach(function(entity) {

						var x = (entity.position.x / _TILE) | 0;
						var y = (entity.position.y / _TILE) | 0;

						var type = 0;
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

				var cache = {
					terrain: [],
					objects: []
				};


				data.forEach(function(line, y) {

					line.forEach(function(type, x) {

						var position = {
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

