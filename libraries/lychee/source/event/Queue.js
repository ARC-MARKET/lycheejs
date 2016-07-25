
lychee.define('lychee.event.Queue').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _process_stack = function() {

		var data = this.___stack.shift() || null;
		if (data !== null) {

			var that = this;

			this.trigger('update', [ data, function(result) {

				if (result instanceof Object) {
					_process_stack.call(that);
				} else if (result === true) {
					_process_stack.call(that);
				} else {
					that.trigger('error');
				}

			}]);

		} else {

			this.trigger('complete');

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function() {

		this.___init  = false;
		this.___stack = [];

		lychee.event.Emitter.call(this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.event.Queue';

			var blob = (data['blob'] || {});


			if (this.___stack.length > 0) {

				blob.stack = [];

				for (var s = 0, sl = this.___stack.length; s < sl; s++) {
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

