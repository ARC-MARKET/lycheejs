
lychee.define('lychee.event.Queue').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	const _Emitter = lychee.import('lychee.event.Emitter');



	/*
	 * HELPERS
	 */

	const _process_recursive = function(result) {

		if (result instanceof Object) {
			_process_stack.call(this);
		} else if (result === true) {
			_process_stack.call(this);
		} else {
			this.trigger('error');
		}

	};

	const _process_stack = function() {

		let data = this.___stack.shift() || null;
		if (data !== null) {

			this.trigger('update', [ data, _process_recursive.bind(this) ]);

		} else {

			this.trigger('complete');

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function() {

		this.___init  = false;
		this.___stack = [];

		_Emitter.call(this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.event.Queue';

			let blob = (data['blob'] || {});


			if (this.___stack.length > 0) {

				blob.stack = [];

				for (let s = 0, sl = this.___stack.length; s < sl; s++) {
					blob.stack.push(lychee.serialize(this.___stack[s]));
				}

			}


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		then: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				this.___stack.push(data);

				return true;

			}


			return false;

		},

		init: function() {

			if (this.___init === false) {

				this.___init = true;


				if (this.___stack.length > 0) {

					_process_stack.call(this);

					return true;

				} else {

					this.trigger('error');

				}

			}


			return false;

		}

	};


	return Composite;

});

