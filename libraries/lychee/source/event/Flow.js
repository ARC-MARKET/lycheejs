
lychee.define('lychee.event.Flow').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	const _Emitter = lychee.import('lychee.event.Emitter');



	/*
	 * HELPERS
	 */

	const _process_recursive = function(event, result) {

		if (result === true) {

			if (this.___timeout === null) {

				this.___timeout = setTimeout(function() {

					this.___timeout = null;
					_process_stack.call(this);

				}.bind(this), 0);

			}

		} else {

			this.trigger('error', [ event ]);

		}

	};

	const _process_stack = function() {

		let entry = this.___stack.shift() || null;
		if (entry !== null) {

			let data  = entry.data;
			let event = entry.event;
			let args  = [ event, [] ];

			if (data !== null) {
				args[1].push.apply(args[1], data);
			}

			args[1].push(_process_recursive.bind(this, event));


			let result = this.trigger.apply(this, args);
			if (result === false) {
				this.trigger('error', [ event ]);
			}

		} else {

			this.trigger('complete');

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function() {

		this.___init    = false;
		this.___stack   = [];
		this.___timeout = null;

		_Emitter.call(this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.event.Flow';

			let blob = (data['blob'] || {});


			if (this.___stack.length > 0) {

				blob.stack = [];

				for (let s = 0, sl = this.___stack.length; s < sl; s++) {

					let entry = this.___stack[s];

					blob.stack.push({
						event: entry.event,
						data:  lychee.serialize(entry.data)
					});

				}

			}


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		then: function(event, data) {

			event = typeof event === 'string' ? event : null;
			data  = data instanceof Array     ? data  : null;


			if (event !== null) {

				this.___stack.push({
					event: event,
					data:  data
				});

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

				}

			}


			return false;

		}

	};


	return Composite;

});

