
lychee.define('game.ui.entity.Label').includes([
	'lychee.ui.entity.Label'
]).exports((lychee, global, attachments) => {

	const _Label = lychee.import('lychee.ui.entity.Label');
	const _FONT  = attachments['fnt'];



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({
			font: _FONT
		}, data);


		_Label.call(this, states);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Label.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.entity.Label';


			return data;

		}

	};


	return Composite;

});

