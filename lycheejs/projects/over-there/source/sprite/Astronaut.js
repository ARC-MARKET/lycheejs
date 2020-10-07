
lychee.define('app.sprite.Astronaut').requires([
	'lychee.app.Entity'
]).includes([
	'lychee.app.Sprite'
]).exports((lychee, global, attachments) => {

	let   _id       = 0;
	const _Entity   = lychee.import('lychee.app.Entity');
	const _Sprite   = lychee.import('lychee.app.Sprite');
	const _CONFIG   = attachments['json'].buffer;
	const _TEXTURES = [
		attachments['blue.png'],
		attachments['light.png'],
		attachments['green.png'],
		attachments['red.png'],
		attachments['orange.png'],
		attachments['pink.png'],
		attachments['purple.png'],
		attachments['yellow.png']
	];



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.properties = {};


		states.width   = 32;
		states.height  = 32;
		states.map     = _CONFIG.map;
		states.shape   = _Entity.SHAPE.rectangle;
		states.states  = _CONFIG.states;
		states.state   = states.state || _CONFIG.state;
		states.texture = _TEXTURES[_id++];


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
			data['constructor'] = 'app.sprite.Astronaut';


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

