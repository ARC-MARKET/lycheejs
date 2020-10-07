
lychee.define('app.sprite.Room').requires([
	'lychee.app.Entity'
]).includes([
	'lychee.app.Sprite'
]).exports((lychee, global, attachments) => {

	const _Entity  = lychee.import('lychee.app.Entity');
	const _Sprite  = lychee.import('lychee.app.Sprite');
	const _CONFIG  = attachments['json'].buffer;
	const _TEXTURE = attachments['png'];



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.properties = {};


		states.width   = 0;
		states.height  = 0;
		states.map     = _CONFIG.map;
		states.shape   = _Entity.SHAPE.rectangle;
		states.state   = states.state || 'default';
		states.states  = _CONFIG.states;
		states.texture = _TEXTURE;


		this.setProperties(states.properties);

		delete states.properties;


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
			data['constructor'] = 'app.sprite.Room';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setProperties: function(properties) {

			properties = properties instanceof Object ? properties : null;


			if (properties !== null) {

				this.properties = properties;


				return true;

			}


			return false;

		}

	};


	return Composite;

});

