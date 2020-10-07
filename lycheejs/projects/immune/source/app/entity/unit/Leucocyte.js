
lychee.define('game.app.entity.unit.Leucocyte').includes([
	'game.app.entity.Unit'
]).exports((lychee, global, attachments) => {

	const _Unit = lychee.import('game.app.entity.Unit');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({
			team:   'neutral',
			damage: 100,
			health: 200,
			radius: 15,
			speed:  500
		}, data);


		_Unit.call(this, states);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Unit.prototype.serialize.call(this);
			data['constructor'] = 'game.app.entity.unit.Leucocyte';

			return data;

		}

	};


	return Composite;

});

