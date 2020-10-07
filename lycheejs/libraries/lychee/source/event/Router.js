
lychee.define('lychee.event.Router').includes([
	'lychee.event.Emitter'
]).exports((lychee, global, attachments) => {

	const _Emitter = lychee.import('lychee.event.Emitter');



	/*
	 * HELPERS
	 */

	const _get_event = function(path, data) {

		let event  = null;
		let chunks = path.split('/').map(value => {

			let val = value;
			if (val === 'true') {
				val = true;
			} else if (val === 'false') {
				val = false;
			} else if (/^([0-9]+)\.([0-9]+)$/g.test(val)) {
				val = parseFloat(val);
			} else if (/^([0-9]+)$/g.test(val)) {
				val = parseInt(val, 10);
			}

			return val;

		});


		for (let route in this.__routes) {

			let parts = route.split('/');
			if (parts.length === chunks.length) {

				let blob  = {};
				let valid = true;

				for (let c = 0, cl = chunks.length; c < cl; c++) {

					let chunk = chunks[c];
					let part  = parts[c];

					if (part.charAt(0) === ':') {

						blob[part.substr(1)] = chunk;

					} else if (part !== chunk) {

						valid = false;

						break;

					}

				}


				if (valid === true) {

					event = route;

					if (data instanceof Array) {
						Object.assign(data[0], blob);
					} else if (data instanceof Object) {
						Object.assign(data, blob);
					}

					break;

				}

			}

		}


		return event;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function() {

		this.__routes = {};

		_Emitter.call(this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.event.Router';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		bind: function(route, callback, scope) {

			route    = typeof route === 'string'    ? route    : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (route !== null && route.charAt(0) === '/') {

				let result = _Emitter.prototype.bind.call(this, route, callback, scope);
				if (result === true) {

					this.__routes[route] = this.___events[route];

					return true;

				}

			}


			return false;

		},

		trigger: function(route, data) {

			route = typeof route === 'string' ? route : null;
			data  = data instanceof Array     ? data  : [{}];


			if (route !== null && route.charAt(0) === '/') {

				let event = _get_event.call(this, route, data);
				if (event !== null) {
					return _Emitter.prototype.trigger.call(this, event, data);
				}

			}


			return false;

		},

		unbind: function(route, callback, scope) {

			route    = typeof route === 'string'    ? route    : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (route !== null && route.charAt(0) === '/') {

				let result = _Emitter.prototype.unbind.call(this, route, callback, scope);
				if (result === true) {
					delete this.__routes[route];
				}

				return result;

			}


			return false;

		}

	};


	return Composite;

});

