
lychee.define('lychee.ui.entity.Upload').tags({
	platform: 'node'
}).includes([
	'lychee.ui.entity.Button'
]).supports((lychee, global) => {

	// XXX: This is a stub API

	return true;

}).exports((lychee, global, attachments) => {

	const _Button = lychee.import('lychee.ui.entity.Button');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({
			label: 'UPLOAD'
		}, data);


		this.type  = Composite.TYPE.asset;
		this.value = [];


		this.setType(states.type);
		this.setValue(states.value);

		delete states.type;
		delete states.value;


		_Button.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.unbind('touch');
		this.bind('touch', function() {

			if (this.state === 'active') {
				// TODO: Show file dialog
				// TODO: trigger 'change' with null on no selection
				// TODO: trigger 'change' with Asset array on selection
			}

		}, this);

	};


	Composite.TYPE = {
		'all':     0,
		'config':  1,
		'font':    2,
		'music':   3,
		'sound':   4,
		'texture': 5,
		'stuff':   6
	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Button.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.entity.Upload';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setType: function(type) {

			type = lychee.enumof(Composite.TYPE, type) ? type : null;


			if (type !== null) {

				this.type = type;

				return true;

			}


			return false;

		},

		setValue: function(value) {

			value = value instanceof Array ? value : null;


			if (value !== null) {

				this.value = value.filter(asset => {

					if (asset instanceof global.Config)  return true;
					if (asset instanceof global.Font)    return true;
					if (asset instanceof global.Music)   return true;
					if (asset instanceof global.Sound)   return true;
					if (asset instanceof global.Texture) return true;
					if (asset instanceof global.Stuff)   return true;


					return false;

				});


				return true;

			}


			return false;

		}

	};


	return Composite;

});

