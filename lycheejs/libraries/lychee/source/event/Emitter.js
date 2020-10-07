
lychee.define('lychee.event.Emitter').exports((lychee, global, attachments) => {

	/*
	 * HELPERS
	 */

	const _has = function(event, callback, scope) {

		let found = false;

		if (event !== null) {

			found = _has_event.call(this, event, callback, scope);

		} else {

			for (event in this.___events) {

				let result = _has_event.call(this, event, callback, scope);
				if (result === true) {
					found = true;
					break;
				}

			}

		}

		return found;

	};

	const _has_event = function(event, callback, scope) {

		if (this.___events !== undefined && this.___events[event] !== undefined) {

			let found = false;

			for (let e = 0, el = this.___events[event].length; e < el; e++) {

				let entry = this.___events[event][e];

				if ((callback === null || entry.callback === callback) && (scope === null || entry.scope === scope)) {
					found = true;
					break;
				}

			}

			return found;

		}


		return false;

	};

	const _bind = function(event, callback, scope, once) {

		if (event === null || callback === null) {
			return false;
		}


		let pass_event = false;
		let pass_self  = false;

		let modifier = event.charAt(0);
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

	const _publish = function(event, instance, once) {

		if (event === null || instance === null) {
			return false;
		}


		let callback = function() {

			let event = arguments[0];
			let data  = [];

			for (let a = 1, al = arguments.length; a < al; a++) {
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

	const _subscribe = function(event, instance, once) {

		if (event === null || instance === null) {
			return false;
		}


		let callback = function() {

			let event = arguments[0];
			let data  = [];

			for (let a = 1, al = arguments.length; a < al; a++) {
				data.push(arguments[a]);
			}

			this.trigger(event, data);

		};


		if (instance.___events[event] === undefined) {
			instance.___events[event] = [];
		}


		instance.___events[event].push({
			pass_event: true,
			pass_self:  false,
			callback:   callback,
			scope:      this,
			once:       once
		});


		return true;

	};

	const _transfer = function(event, instance, once) {

		if (event === null || instance === null) {
			return false;
		}


		let events = this.___events[event] || [];
		if (events.length > 0) {

			if (instance.___events[event] === undefined) {
				instance.___events[event] = [];
			}

			for (let e = 0, el = events.length; e < el; e++) {

				let entry = this.___events[event][e];

				instance.___events[event].push({
					pass_event: entry.pass_event,
					pass_self:  entry.pass_self,
					callback:   entry.callback,
					scope:      instance,
					once:       once
				});

			}

		}


		return true;

	};

	const _trigger = function(event, data) {

		if (this.___events !== undefined && this.___events[event] !== undefined) {

			let value = undefined;

			for (let e = 0; e < this.___events[event].length; e++) {

				let args  = [];
				let entry = this.___events[event][e];

				if (entry.pass_event === true) {

					args.push(event);

				} else if (entry.pass_self === true) {

					args.push(this);

				}


				if (data !== null) {
					args.push.apply(args, data);
				}


				let result = entry.callback.apply(entry.scope, args);
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

	const _unbind = function(event, callback, scope) {

		let found = false;

		if (event !== null) {

			found = _unbind_event.call(this, event, callback, scope);

		} else {

			for (event in this.___events) {

				let result = _unbind_event.call(this, event, callback, scope);
				if (result === true) {
					found = true;
				}

			}

		}

		return found;

	};

	const _unbind_event = function(event, callback, scope) {

		if (this.___events !== undefined && this.___events[event] !== undefined) {

			let found = false;

			for (let e = 0, el = this.___events[event].length; e < el; e++) {

				let entry = this.___events[event][e];

				if ((callback === null || entry.callback === callback) && (scope === null || entry.scope === scope)) {

					found = true;

					this.___events[event].splice(e, 1);
					el--;
					e--;

				}

			}

			return found;

		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function() {

		this.___events   = {};
		this.___timeline = {
			bind:      [],
			has:       [],
			publish:   [],
			subscribe: [],
			transfer:  [],
			trigger:   [],
			unbind:    []
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

			let blob = {};


			if (Object.keys(this.___events).length > 0) {

				blob.events = {};

				for (let event in this.___events) {

					blob.events[event] = [];

					for (let e = 0, el = this.___events[event].length; e < el; e++) {

						let entry = this.___events[event][e];

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


			let timeline = {};

			if (this.___timeline.bind.length > 0) {

				timeline.bind = [];

				for (let b = 0, bl = this.___timeline.bind.length; b < bl; b++) {
					timeline.bind.push(this.___timeline.bind[b]);
				}

			}

			if (this.___timeline.has.length > 0) {

				timeline.has = [];

				for (let h = 0, hl = this.___timeline.has.length; h < hl; h++) {
					timeline.has.push(this.___timeline.has[h]);
				}

			}

			if (this.___timeline.publish.length > 0) {

				timeline.publish = [];

				for (let p = 0, pl = this.___timeline.publish.length; p < pl; p++) {
					timeline.publish.push(this.___timeline.publish[p]);
				}

			}

			if (this.___timeline.subscribe.length > 0) {

				timeline.subscribe = [];

				for (let s = 0, sl = this.___timeline.subscribe.length; s < sl; s++) {
					timeline.subscribe.push(this.___timeline.subscribe[s]);
				}

			}

			if (this.___timeline.transfer.length > 0) {

				timeline.transfer = [];

				for (let t = 0, tl = this.___timeline.transfer.length; t < tl; t++) {
					timeline.transfer.push(this.___timeline.transfer[t]);
				}

			}

			if (this.___timeline.trigger.length > 0) {

				timeline.trigger = [];

				for (let t = 0, tl = this.___timeline.trigger.length; t < tl; t++) {
					timeline.trigger.push(this.___timeline.trigger[t]);
				}

			}

			if (this.___timeline.unbind.length > 0) {

				timeline.unbind = [];

				for (let u = 0, ul = this.___timeline.unbind.length; u < ul; u++) {
					timeline.unbind.push(this.___timeline.unbind[u]);
				}

			}

			if (Object.keys(timeline).length > 0) {
				blob.timeline = timeline;
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


			let result = _bind.call(this, event, callback, scope, once);
			if (result === true && lychee.debug === true) {

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

		},

		has: function(event, callback, scope) {

			event    = typeof event === 'string'    ? event    : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			let result = _has.call(this, event, callback, scope);
			if (result === true && lychee.debug === true) {

				this.___timeline.has.push({
					time:     Date.now(),
					event:    event,
					callback: lychee.serialize(callback),
					// scope:    lychee.serialize(scope)
					scope:    null
				});

			}


			return result;

		},

		publish: function(event, instance, once) {

			event    = typeof event === 'string'               ? event    : null;
			instance = lychee.interfaceof(Composite, instance) ? instance : null;
			once     = once === true;


			let result = _publish.call(this, event, instance, once);
			if (result === true && lychee.debug === true) {

				this.___timeline.publish.push({
					time:     Date.now(),
					event:    event,
					instance: lychee.serialize(instance),
					once:     once
				});

			}


			return result;

		},

		subscribe: function(event, instance, once) {

			event    = typeof event === 'string'               ? event    : null;
			instance = lychee.interfaceof(Composite, instance) ? instance : null;
			once     = once === true;


			let result = _subscribe.call(this, event, instance, once);
			if (result === true && lychee.debug === true) {

				this.___timeline.subscribe.push({
					time:     Date.now(),
					event:    event,
					instance: lychee.serialize(instance),
					once:     once
				});

			}


			return result;

		},

		transfer: function(event, instance, once) {

			event    = typeof event === 'string'               ? event    : null;
			instance = lychee.interfaceof(Composite, instance) ? instance : null;
			once     = once === true;


			let result = _transfer.call(this, event, instance, once);
			if (result === true && lychee.debug === true) {

				this.___timeline.transfer.push({
					time:     Date.now(),
					event:    event,
					instance: lychee.serialize(instance),
					once:     once
				});

			}


			return result;

		},

		trigger: function(event, data) {

			event = typeof event === 'string' ? event : null;
			data  = data instanceof Array     ? data  : null;


			let result = _trigger.call(this, event, data);
			if (result === true && lychee.debug === true) {

				this.___timeline.trigger.push({
					time:  Date.now(),
					event: event,
					data:  lychee.serialize(data)
				});

			}


			return result;

		},

		unbind: function(event, callback, scope) {

			event    = typeof event === 'string'    ? event    : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : null;


			let result = _unbind.call(this, event, callback, scope);
			if (result === true) {

				this.___timeline.unbind.push({
					time:     Date.now(),
					event:    event,
					callback: lychee.serialize(callback),
					// scope:    lychee.serialize(scope)
					scope:    null
				});

			}


			return result;

		}

	};


	return Composite;

});

