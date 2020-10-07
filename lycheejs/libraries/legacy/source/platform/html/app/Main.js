
lychee.define('legacy.app.Main').tags({
	platform: 'html'
}).requires([
	'legacy.Input',
	'legacy.Renderer',
	'legacy.app.State'
]).includes([
	'lychee.app.Main'
]).supports((lychee, global) => {

	if (
		typeof global.document !== 'undefined'
		&& typeof global.document.createElement === 'function'
	) {

		try {

			global.document.createElement('legacy-app-Main');

			return true;

		} catch (err) {
		}

	}


	return false;

}).exports((lychee, global, attachments) => {

	const _legacy  = lychee.import('legacy');
	const _Main    = lychee.import('lychee.app.Main');
	const _State   = lychee.import('legacy.app.State');
	let   _ELEMENT = null;



	/*
	 * FEATURE DETECTION
	 */

	(function(document) {

		let element = document.createElement('legacy-app-Main');
		if (element !== null) {

			document.body.appendChild(element);
			_ELEMENT = element;

		}

	})(global.document);



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		_Main.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function(oncomplete) {

			this.settings.legacyinput    = this.settings.input;
			this.settings.input          = null;

			this.settings.legacyrenderer = this.settings.renderer;
			this.settings.renderer       = null;

			oncomplete(true);

		}, this, true);

		this.bind('init', function() {

			let legacyinput = this.settings.legacyinput;
			if (legacyinput !== null) {
				this.input = new _legacy.Input(legacyinput);
			}

			let legacyrenderer = this.settings.legacyrenderer;
			if (legacyrenderer !== null) {
				this.renderer = new _legacy.Renderer(legacyrenderer);
			}

		}, this, true);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Main.prototype.serialize.call(this);
			data['constructor'] = 'legacy.app.Main';


			return data;

		},

		setState: function(id, state) {

			id    = typeof id === 'string'            ? id    : null;
			state = lychee.interfaceof(_State, state) ? state : null;


			if (id !== null && state !== null) {

				if (_ELEMENT !== null) {
					_ELEMENT.appendChild(state._element);
				}

				state._element.id = id;
				this.__states[id] = state;


				return true;

			}


			return false;

		},

		removeState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && this.__states[id] !== undefined) {

				if (_ELEMENT !== null) {
					_ELEMENT.removeChild(this.__states[id]._element);
				}

				if (this.state === this.__states[id]) {
					this.changeState(null);
				}


				delete this.__states[id];


				return true;

			}

		}

	};


	return Composite;

});

