
lychee.define('lychee.game.Layer').exports(function(lychee, global) {

	var _id = 0;


	var Class = function() {

		this.__cache     = [];
		this.__isVisible = true;

	};


	Class.prototype = {

		show: function() {
			this.__isVisible = true;
		},

		hide: function() {
			this.__isVisible = false;
		},

		isVisible: function() {
			return this.__isVisible === true;
		},

		addEntity: function(entity) {

			if (
				entity != null
				&& typeof entity.update === 'function'
			) {

				var found = false;
				for (var c = 0, cl = this.__cache.length; c < cl; c++) {

					var cached = this.__cache[c];
					if (cached === entity) {
						found = true;
						break;
					}

				}


				if (found === false) {
					this.__cache.push(entity);
					return true;
				}

			}


			return false;

		},

		getEntities: function() {
			return this.__cache;
		},

		removeEntity: function(entity) {

			var found = false;

			if (
				entity != null
				&& typeof entity.update === 'function'
			) {

				for (var c = 0, cl = this.__cache.length; c < cl; c++) {

					var cached = this.__cache[c];
					if (cached === entity) {
						this.__cache.splice(c, 1);
						found = true;
						cl--;
					}

				}

			}


			return found;

		}

	};


	return Class;

});

