
lychee.define('game.logic.Pathfinder').requires([
	'game.app.entity.Cell'
]).exports((lychee, global, attachments) => {

	const _Cell = lychee.import('game.app.entity.Cell');



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'game.logic.Pathfinder',
				'arguments': []
			};

		},

		generate: function(entities) {

			entities = entities instanceof Array ? entities : null;


			let map = {
				paths:    {},
				vesicles: {}
			};

			if (entities !== null) {

				let cells = entities.filter(entity => entity instanceof _Cell);

				cells.forEach(cell_a => {

					cells.filter(cell => cell !== cell_a).forEach(cell_b => {

						let vesicle_a = cell_a.getVesicle(null, cell_b.position);
						let vesicle_b = cell_b.getVesicle(null, cell_a.position);

						if (vesicle_a !== null && vesicle_b !== null) {

							cells.filter(cell => cell !== cell_a && cell !== cell_b).forEach(cell => {

								if (cell.collides(vesicle_a) === true) {
									vesicle_a = null;
								}

								if (cell.collides(vesicle_b) === true) {
									vesicle_b = null;
								}

							});

						}

						if (vesicle_a !== null && vesicle_b !== null) {

							if (map.vesicles[vesicle_a.id] === undefined) {
								map.vesicles[vesicle_a.id] = {
									position: {
										x: cell_a.position.x + vesicle_a.position.x,
										y: cell_a.position.y + vesicle_a.position.y
									},
									vesicle: vesicle_a
								};
							}

							if (map.vesicles[vesicle_b.id] === undefined) {
								map.vesicles[vesicle_b.id] = {
									position: {
										x: cell_b.position.x + vesicle_b.position.x,
										y: cell_b.position.y + vesicle_b.position.y
									},
									vesicle: vesicle_b
								};
							}


							if (map.paths[vesicle_a.id] === undefined) {
								map.paths[vesicle_a.id] = [ vesicle_b.id ];
							} else if (map.paths[vesicle_a.id].includes(vesicle_b.id) === false) {
								map.paths[vesicle_a.id].push(vesicle_b.id);
							}

							if (map.paths[vesicle_b.id] === undefined) {
								map.paths[vesicle_b.id] = [ vesicle_a.id ];
							} else if (map.paths[vesicle_b.id].includes(vesicle_a.id) === false) {
								map.paths[vesicle_b.id].push(vesicle_a.id);
							}

						}

					});

				});

			}

			return map;

		}

	};


	return Module;

});

