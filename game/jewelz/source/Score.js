
lychee.define('game.Score').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global) {

	var Class = function() {

		this.__data = {
			points: 0,
			time:   0
		};

		lychee.event.Emitter.call(this, 'score');

	};


	Class.prototype = {

		get: function(key) {

			if (key === undefined) {
				return this.__data;
			} else {
				return this.__data[key] || null;
			}

		},

		set: function(key, value) {

			this.__data[key] = value;
			this.trigger('update', [ this.__data ]);

		},

		add: function(key, value) {

			value = typeof value === 'number' ? value : 0;

			if (this.__data[key] === undefined) {
				this.__data[key] = 0;
			}

			this.__data[key] += value;
			this.trigger('update', [ this.__data ]);

		},

		subtract: function(key, value) {

			value = typeof value === 'number' ? value : 0;

			if (this.__data[key] === undefined) {
				this.__data[key] = 0;
			}

			this.__data[key] -= value;
			this.trigger('update', [ this.__data ]);

		}

	};


	return Class;

});

