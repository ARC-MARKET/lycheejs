
lychee.define('lychee.event.Emitter').exports(function(lychee, global) {

	// High Performance Implementation of a generic Event Emitter

	var Class = function(namespace) {

		this.___namespace    = namespace;
		this.___events       = {};

	};


	Class.prototype = {

		bind: function(type, callback, scope, once) {

			type     = typeof type === 'string' ? type : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined ? scope : this;
			once     = once === true;


			if (type === null && callback === null) {
				return false;
			}


			var passSelf = false;
			if (type.charAt(0) === '#') {
				type = type.substr(1, type.length - 1);
				passSelf = true;
			}

			if (this.___events[type] === undefined) {
				this.___events[type] = [];
			}


			this.___events[type].push({
				callback: callback,
				scope:    scope,
				once:     once
			});


			return true;

		},

		trigger: function(type, data) {

			type = typeof type === 'string' ? type : null;
			data = data instanceof Array ? data : null;


			var passData = data;

			if (this.___events[type] !== undefined) {

				for (var e = 0, el = this.___events[type].length; e < el; e++) {

					var entry = this.___events[type][e];

					if (entry.passSelf === true) {

						if (passData !== null) {
							passData = [ this ];
							passData.push.apply(passData, data);
						} else {
							passData = [ this ];
						}

					}


					entry.callback.apply(entry.scope, passData);


					if (entry.once === true) {
						this.unbind(type, entry.callback, entry.scope);
					}

				}


				return true;

			}


			return false;

		},

		unbind: function(type, callback, scope) {

			type     = typeof type === 'string' ? type : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined ? scope : null;


			if (this.___events[type] === undefined) {
				return true;
			}


			var found = false;

			for (var e = 0, el = this.___events[type].length; e < el; e++) {

				var entry = this.___events[type][e];

				if (
					(callback === null || entry.callback === callback)
					&& (scope === null || entry.scope === scope)
				) {

					found = true;

					this.___events[type].splice(e, 1);
					el--;

				}

			}


			return found;

		}

	};


	return Class;

});

