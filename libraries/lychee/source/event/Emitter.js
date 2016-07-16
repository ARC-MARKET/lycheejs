
lychee.define('lychee.event.Emitter').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _bind = function(event, callback, scope, once) {

		if (event === null || callback === null) {
			return false;
		}


		var pass_event = false;
		var pass_self  = false;

		var modifier = event.charAt(0);
		if (modifier === '@') {

			event      = event.substr(1, event.length - 1);
			pass_event = true;

		} else if (modifier === '#') {

			event     = event.substr(1, event.length - 1);
			pass_self = true;

		}


		if (this.___events[event] === undefined) {
			this.___events[event] = [];
		}


		this.___events[event].push({
			pass_event: pass_event,
			pass_self:  pass_self,
			callback:   callback,
			scope:      scope,
			once:       once
		});


		return true;

	};

	var _relay = function(event, instance, once) {

		if (event === null || instance === null) {
			return false;
		}


		var callback = function() {

			var event = arguments[0];
			var data  = [];

			for (var a = 1, al = arguments.length; a < al; a++) {
				data.push(arguments[a]);
			}

			this.trigger(event, data);

		};


		if (this.___events[event] === undefined) {
			this.___events[event] = [];
		}


		this.___events[event].push({
			pass_event: true,
			pass_self:  false,
			callback:   callback,
			scope:      instance,
			once:       once
		});


		return true;

	};

	var _trigger = function(event, data) {

		if (this.___events !== undefined && this.___events[event] !== undefined) {

			var value = undefined;

			for (var e = 0; e < this.___events[event].length; e++) {

				var args  = [];
				var entry = this.___events[event][e];

				if (entry.pass_event === true) {

					args.push(event);

				} else if (entry.pass_self === true) {

					args.push(this);

				}


				if (data !== null) {
					args.push.apply(args, data);
				}


				var result = entry.callback.apply(entry.scope, args);
				if (result !== undefined) {
					value = result;
				}


				if (entry.once === true) {

					if (this.unbind(event, entry.callback, entry.scope) === true) {
						e--;
					}

				}

			}


			if (value !== undefined) {
				return value;
			} else {
				return true;
			}

		}


		return false;

	};

	var _unbind = function(event, callback, scope) {

		var found = false;

		if (event !== null) {

			found = _unbind_event.call(this, event, callback, scope);

		} else {

			for (event in this.___events) {

				var result = _unbind_event.call(this, event, callback, scope);
				if (result === true) {
					found = true;
				}

			}

		}


		return found;

	};

	var _unbind_event = function(event, callback, scope) {

		if (this.___events !== undefined && this.___events[event] !== undefined) {

			var found = false;

			for (var e = 0, el = this.___events[event].length; e < el; e++) {

				var entry = this.___events[event][e];

				if ((callback === null || entry.callback === callback) && (scope === null || entry.scope === scope)) {

					found = true;

					this.___events[event].splice(e, 1);
					el--;

				}

			}


			return found;

		}


		return false;

	};


	if (lychee.debug === true) {

		var _original_bind    = _bind;
		var _original_trigger = _trigger;
		var _original_unbind  = _unbind;


		_bind = function(event, callback, scope, once) {

			var result = _original_bind.call(this, event, callback, scope, once);
			if (result !== false) {

				this.___timeline.bind.push({
					time:     Date.now(),
					event:    event,
					callback: lychee.serialize(callback),
					// scope:    lychee.serialize(scope),
					scope:    null,
					once:     once
				});

			}

			return result;

		};

		_trigger = function(event, data) {

			var result = _original_trigger.call(this, event, data);
			if (result !== false) {

				this.___timeline.trigger.push({
					time:  Date.now(),
					event: event,
					data:  lychee.serialize(data)
				});

			}

			return result;

		};

		_unbind = function(event, callback, scope) {

			var result = _original_unbind.call(this, event, callback, scope);
			if (result !== false) {

				this.___timeline.unbind.push({
					time:     Date.now(),
					event:    event,
					callback: lychee.serialize(callback),
					// scope:    lychee.serialize(scope)
					scope:    null
				});

			}

			return result;

		};

	}



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function() {

		this.___events   = {};
		this.___timeline = {
			bind:    [],
			trigger: [],
			unbind:  []
		};

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.events instanceof Object) {
				// TODO: deserialize events
			}

			if (blob.timeline instanceof Object) {
				// TODO: deserialize timeline
			}

		},

		serialize: function() {

			var blob = {};


			if (Object.keys(this.___events).length > 0) {

				blob.events = {};

				for (var event in this.___events) {

					blob.events[event] = [];

					for (var e = 0, el = this.___events[event].length; e < el; e++) {

						var entry = this.___events[event][e];

						blob.events[event].push({
							pass_event: entry.pass_event,
							pass_self:  entry.pass_self,
							callback:   lychee.serialize(entry.callback),
							// scope:      lychee.serialize(entry.scope),
							scope:      null,
							once:       entry.once
						});

					}

				}

			}


			if (this.___timeline.bind.length > 0 || this.___timeline.trigger.length > 0 || this.___timeline.unbind.length > 0) {

				blob.timeline = {};


				if (this.___timeline.bind.length > 0) {

					blob.timeline.bind = [];

					for (var b = 0, bl = this.___timeline.bind.length; b < bl; b++) {
						blob.timeline.bind.push(this.___timeline.bind[b]);
					}

				}

				if (this.___timeline.trigger.length > 0) {

					blob.timeline.trigger = [];

					for (var t = 0, tl = this.___timeline.trigger.length; t < tl; t++) {
						blob.timeline.trigger.push(this.___timeline.trigger[t]);
					}

				}

				if (this.___timeline.unbind.length > 0) {

					blob.timeline.unbind = [];

					for (var u = 0, ul = this.___timeline.unbind.length; u < ul; u++) {
						blob.timeline.unbind.push(this.___timeline.unbind[u]);
					}

				}

			}


			return {
				'constructor': 'lychee.event.Emitter',
				'arguments':   [],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		bind: function(event, callback, scope, once) {

			event    = typeof event === 'string'    ? event    : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;
			once     = once === true;


			return _bind.call(this, event, callback, scope, once);

		},

		relay: function(event, instance, once) {

			event    = typeof event === 'string'           ? event    : null;
			instance = lychee.interfaceof(Composite, instance) ? instance : null;
			once     = once === true;


			return _relay.call(this, event, instance, once);

		},

		trigger: function(event, data) {

			event = typeof event === 'string' ? event : null;
			data  = data instanceof Array     ? data : null;


			return _trigger.call(this, event, data);

		},

		unbind: function(event, callback, scope) {

			event    = typeof event === 'string'    ? event    : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : null;


			return _unbind.call(this, event, callback, scope);

		}

	};


	return Composite;

});

