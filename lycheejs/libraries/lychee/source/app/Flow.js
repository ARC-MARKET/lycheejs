
lychee.define('lychee.app.Flow').includes([
	'lychee.event.Emitter'
]).exports((lychee, global, attachments) => {

	const _Emitter = lychee.import('lychee.event.Emitter');



	/*
	 * HELPERS
	 */

	const _process_recursive = function(count, result) {

		if (result === true) {

			if (this.___timeout === null) {

				this.___timeout = setTimeout(_ => {
					this.___timeout = null;
					_process_stack.call(this);
				}, 0);

			}

		} else {

			this.trigger('error', [ count ]);

		}

	};

	const _process_stack = function() {

		let entry = this.___stack.shift() || null;
		if (entry !== null) {

			let count    = this.___count++;
			let callback = entry.callback;
			let scope    = entry.scope;


			try {

				callback.call(scope, _process_recursive.bind(this, count));

			} catch (err) {

				this.trigger('error', [ err ]);

			}


		} else {

			this.trigger('complete');

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(main) {

		this.main     = main          || null;
		this.client   = main.client   || null;
		this.server   = main.server   || null;

		this.input    = main.input    || null;
		this.jukebox  = main.jukebox  || null;
		this.loop     = main.loop     || null;
		this.renderer = main.renderer || null;
		this.storage  = main.storage  || null;
		this.viewport = main.viewport || null;


		this.___count    = 0;
		this.___init     = false;
		this.___stack    = [];
		this.___timeline = {
			then: []
		};
		this.___timeout  = null;

		_Emitter.call(this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.stack instanceof Array) {
				// TODO: deserialize stack
			}

		},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.app.Flow';


			let blob = (data['blob'] || {});


			if (this.___stack.length > 0) {

				blob.stack = [];

				for (let s = 0, sl = this.___stack.length; s < sl; s++) {

					let entry = this.___stack[s];

					blob.stack.push({
						callback: lychee.serialize(entry.callback),
						// scope:    lychee.serialize(entry.scope),
						scope: null
					});

				}

			}


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		init: function() {

			if (this.___init === false) {

				this.___init = true;


				if (this.___stack.length > 0) {

					_process_stack.call(this);

					return true;

				}

			}


			return false;

		},

		reset: function() {

			this.__stack = [];

			return true;

		},

		then: function(callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (callback !== null) {

				this.___stack.push({
					callback: callback,
					scope:    scope
				});

				return true;

			}


			return false;

		}

	};


	return Composite;

});

