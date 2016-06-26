
lychee.define('lychee.app.Loop').includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof setInterval === 'function') {
		return true;
	}

	return false;

}).exports(function(lychee, global, attachments) {

    var _instances = [];
 	var _id        = 0;



	/*
	 * EVENTS
	 */

	var _listeners = {

		interval: function() {

			var now = Date.now();

			for (var i = 0, l = _instances.length; i < l; i++) {

				var instance = _instances[i];
				var clock    = now - instance.__start;

				_update_loop.call(instance, clock);
				_render_loop.call(instance, clock);

			}

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	(function(delta) {

		var interval = typeof global.setInterval === 'function';
		if (interval === true) {
			global.setInterval(_listeners.interval, delta);
		}


		if (lychee.debug === true) {

			var methods = [];

			if (interval) methods.push('setInterval');

			if (methods.length === 0) {
				console.error('lychee.app.Loop: Supported methods are NONE');
			} else {
				console.log('lychee.app.Loop: Supported methods are ' + methods.join(', '));
			}

		}

	})((1000 / 60) | 0);



	/*
	 * HELPERS
	 */

	var _update_loop;

	if (lychee.debug === true) {

		_update_loop = function(clock) {

			if (this.__state !== 1) return;


			var delta = clock - this.__updateclock;
			if (delta >= this.__updatedelay) {

				this.trigger('update', [ clock, delta ]);


				for (var iid in this.__intervals) {

					var interval = this.__intervals[iid];

					if (clock >= interval.clock) {

						try {

							interval.callback.call(
								interval.scope,
								clock,
								clock - interval.clock,
								interval.step++
							);

						} catch(err) {
							lychee.Debugger.report(null, err, null);
							this.stop();
						} finally {
							interval.clock = clock + interval.delta;
						}

					}

				}


				for (var tid in this.__timeouts) {

					var timeout = this.__timeouts[tid];
					if (clock >= timeout.clock) {

						try {

							timeout.callback.call(
								timeout.scope,
								clock,
								clock - timeout.clock
							);

						} catch(err) {
							lychee.Debugger.report(null, err, null);
							this.stop();
						} finally {
							delete this.__timeouts[tid];
						}

					}

				}


				this.__updateclock = clock;

			}

		};


	} else {

		_update_loop = function(clock) {

			if (this.__state !== 1) return;


			var delta = clock - this.__updateclock;
			if (delta >= this.__updatedelay) {

				this.trigger('update', [ clock, delta ]);


				for (var iid in this.__intervals) {

					var interval = this.__intervals[iid];

					if (clock >= interval.clock) {

						interval.callback.call(
							interval.scope,
							clock,
							clock - interval.clock,
							interval.step++
						);

						interval.clock = clock + interval.delta;

					}

				}


				for (var tid in this.__timeouts) {

					var timeout = this.__timeouts[tid];
					if (clock >= timeout.clock) {

						timeout.callback.call(
							timeout.scope,
							clock,
							clock - timeout.clock
						);

						delete this.__timeouts[tid];

					}

				}


				this.__updateclock = clock;

			}

		};

	}


	var _render_loop = function(clock) {

		if (this.__state !== 1) return;


		var delta = clock - this.__renderclock;
		if (delta >= this.__renderdelay) {

			this.trigger('render', [ clock, delta ]);


			this.__renderclock = clock;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.update = 40;
		this.render = 40;

		this.__timeouts  = {};
		this.__intervals = {};

		this.__pause       = 0;
		this.__start       = Date.now();
		this.__state       = 1;
		this.__renderclock = 0;
		this.__renderdelay = 1000 / this.update;
		this.__updateclock = 0;
		this.__updatedelay = 1000 / this.render;


		this.setUpdate(settings.update);
		this.setRender(settings.render);


		lychee.event.Emitter.call(this);

		_instances.push(this);

		settings = null;

	};


	Class.prototype = {

		destroy: function() {

			var found = false;

			for (var i = 0, il = _instances.length; i < il; i++) {

				if (_instances[i] === this) {
					_instances.splice(i, 1);
					found = true;
					il--;
					i--;
				}

			}

			this.unbind();


			return found;

		},



		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (typeof blob.state === 'number') {

				this.__state = blob.state;
				this.__pause = blob.pause;

			}

			if (typeof blob.updateclock === 'number') this.__updateclock = blob.updateclock;
			if (typeof blob.renderclock === 'number') this.__renderclock = blob.renderclock;


			if (blob.timeouts instanceof Array) {
				// TODO: deserialize timeouts
			}

			if (blob.intervals instanceof Array) {
				// TODO: deserialize intervals
			}

		},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.app.Loop';


			var settings = {};
			var blob     = (data['blob'] || {});


			if (this.update !== 40) settings.update = this.update;
			if (this.render !== 40) settings.render = this.render;


			if (Object.keys(this.__timeouts).length > 0) {

				blob.timeouts = [];

				for (var tid in this.__timeouts) {

					var timeout = this.__timeouts[tid];

					blob.timeouts.push({
						delta:    timeout.clock - this.__updateclock,
						callback: lychee.serialize(timeout.callback),
						// scope:    lychee.serialize(timeout.scope)
						scope:    null
					});

				}

			}


			if (Object.keys(this.__intervals).length > 0) {

				blob.intervals = [];

				for (var iid in this.__intervals) {

					var interval = this.__intervals[iid];

					blob.intervals.push({
						clock:    interval.clock - this.__updateclock,
						delta:    interval.delta,
						step:     interval.step,
						callback: lychee.serialize(interval.callback),
						// scope:    lychee.serialize(interval.scope)
						scope:    null
					});

				}

			}


			if (this.__state !== 1) {

				blob.pause = this.__pause;
				blob.state = this.__state;

			}

			blob.updateclock = this.__updateclock;
			blob.renderclock = this.__renderclock;


			return {
				'constructor': 'lychee.app.Loop',
				'arguments':   [ settings ],
				'blob':        null
			};

		},



		/*
		 * CUSTOM API
		 */

		start: function() {

			this.__state = 1;
			this.__start = Date.now();

		},

		stop: function() {

			this.__state = 0;

		},

		pause: function() {

			this.__state = 0;
			this.__pause = Date.now() - this.__start;

		},

		resume: function() {

			this.__state = 1;
			this.__start = Date.now() - this.__pause;
			this.__pause = 0;

		},

		setTimeout: function(delta, callback, scope) {

			delta    = typeof delta === 'number'    ? delta    : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : global;


			if (delta === null || callback === null) {
				return null;
			}


			var id = _id++;

			this.__timeouts[id] = {
				clock:    this.__updateclock + delta,
				callback: callback,
				scope:    scope
			};


			return id;

		},

		removeTimeout: function(id) {

			id = typeof id === 'number' ? id : null;


			if (id !== null && this.__timeouts[id] !== undefined) {

				delete this.__timeouts[id];

				return true;

			}


			return false;

		},

		setInterval: function(delta, callback, scope) {

			delta    = typeof delta === 'number'    ? delta    : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : global;


			if (delta === null || callback === null) {
				return null;
			}


			var id = _id++;

			this.__intervals[id] = {
				clock:    this.__updateclock + delta,
				delta:    delta,
				step:     1,
				callback: callback,
				scope:    scope
			};


			return id;

		},

		removeInterval: function(id) {

			id = typeof id === 'number' ? id : null;


			if (id !== null && this.__intervals[id] !== undefined) {

				delete this.__intervals[id];

				return true;

			}


			return false;

		},

		setUpdate: function(update) {

			update = typeof update === 'number' ? update : null;


			if (update !== null && update > 0) {

				this.update        = update;
				this.__updatedelay = 1000 / update;

				return true;

			} else if (update === 0) {

				this.update        = update;
				this.__updatedelay = Infinity;

				return true;

			}


			return false;

		},

		setRender: function(render) {

			render = typeof render === 'number' ? render : null;


			if (render !== null && render > 0) {

				this.render        = render;
				this.__renderdelay = 1000 / render;

				return true;

			} else if (render === 0) {

				this.render        = render;
				this.__renderdelay = Infinity;

				return true;

			}


			return false;

		}

	};


	return Class;

});

