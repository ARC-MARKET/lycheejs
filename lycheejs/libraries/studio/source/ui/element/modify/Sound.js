
lychee.define('studio.ui.element.modify.Sound').requires([
	'studio.codec.SOUND',
	'lychee.ui.entity.Upload'
]).includes([
	'lychee.ui.Element'
]).exports((lychee, global, attachments) => {

	const _Element = lychee.import('lychee.ui.Element');
	const _Upload  = lychee.import('lychee.ui.entity.Upload');
	const _SOUND   = lychee.import('studio.codec.SOUND');
	let   _TIMEOUT = Date.now();



	/*
	 * HELPERS
	 */

	const _on_change = function() {

		if (Date.now() > _TIMEOUT + 100) {

			let settings = this.__settings;
			let value    = _SOUND.encode(settings);
			if (value !== null) {

				if (this.value !== null) {
					value.url = this.value.url;
				}

				this.value = value;
				this.trigger('change', [ this.value ]);

			}


			_TIMEOUT = 0;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.value = null;

		this.__settings = {
			mp3: null,
			ogg: null
		};


		states.label   = 'Modify';
		states.options = [];


		_Element.call(this, states);



		/*
		 * INITIALIZATION
		 */

		this.setEntity('mp3-stream', new _Upload({
			type: _Upload.TYPE.sound
		}));

		this.setEntity('ogg-stream', new _Upload({
			type: _Upload.TYPE.sound
		}));

		this.getEntity('mp3-stream').bind('change', function(value) {

			this.__settings.mp3 = value[0] || null;

			_TIMEOUT = Date.now();
			setTimeout(_on_change.bind(this), 150);
			this.trigger('relayout');

		}, this);

		this.getEntity('ogg-stream').bind('change', function(value) {

			this.__settings.ogg = value[0] || null;

			_TIMEOUT = Date.now();
			setTimeout(_on_change.bind(this), 150);
			this.trigger('relayout');

		}, this);


		this.setValue(states.value);
		this.trigger('relayout');

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'studio.ui.element.modify.Sound';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setValue: function(value) {

			value = value instanceof Sound ? value : null;


			if (value !== null) {

				this.value = value;
				this.setOptions([]);


				return true;

			}


			return false;

		}

	};


	return Composite;

});

