
lychee.define('game.ui.sprite.Tile').requires([
	'lychee.ui.Entity'
]).includes([
	'lychee.ui.Sprite'
]).exports((lychee, global, attachments) => {

	const _Entity  = lychee.import('lychee.ui.Entity');
	const _Sprite  = lychee.import('lychee.ui.Sprite');
	const _TEXTURE = attachments['png'];
	const _CONFIG  = attachments['json'].buffer;



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.x = typeof states.x === 'number' ? states.x : 0;
		this.y = typeof states.y === 'number' ? states.y : 0;


		states.texture = _TEXTURE;
		states.map     = _CONFIG.map;
		states.width   = _CONFIG.width;
		states.height  = _CONFIG.height;
		states.shape   = _Entity.SHAPE.rectangle;
		states.states  = _CONFIG.states;
		states.state   = 'default';


		_Sprite.call(this, states);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.sprite.Tile';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setState: function(state) {

			state = typeof state === 'string' ? state : null;


			if (state !== null) {

				if (this.state === 'default' && state !== 'default') {

					let result = _Sprite.prototype.setState.call(this, state);
					if (result === true) {
						return true;
					}

				} else if (state === 'default') {

					let result = _Sprite.prototype.setState.call(this, state);
					if (result === true) {
						return true;
					}

				}

			}


			return false;

		}

	};


	return Composite;

});

