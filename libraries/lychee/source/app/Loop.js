
lychee.define('lychee.app.Loop').includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof setInterval === 'function') {
		return true;
	}

	return false;

}).exports(function(lychee, global, attachments) {

	const _INSTANCES = [];
	let   _id        = 0;



	/*
	 * EVENTS
	 */

	const _listeners = {

		interval: function() {

			let now = Date.now();

			for (let i = 0, l = _INSTANCES.length; i < l; i++) {

				let instance = _INSTANCES[i];
				let clock    = now - instance.__start;

				_update_loop.call(instance, clock);
				_render_loop.call(instance, clock);

			}

		},

		update: function() {

			let now = Date.now();

			for (let i = 0, l = _INSTANCES.length; i < l; i++) {

				let instance = _INSTANCES[i];
				let clock    = now - instance.__start;

				_update_loop.call(instance, clock);

			}

		},


		// XXX: render loop is inlined for maximum performance
		render: function() {

			let now = Date.now();

			for (let i = 0, l = _INSTANCES.length; i < l; i++) {

				let instance = _INSTANCES[i];
				if (instance.__state === 1) {

					let clock = now   - instance.__start;
					let delta = clock - instance.__renderclock;
					if (delta >= instance.__renderdelay) {
						instance.trigger('render', [ clock, delta ]);
						instance.__renderclock = clock;
					}

				}

			}

			global.requestAnimationFrame(_listeners.render);

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	(function(delta) {

		let interval = typeof global.setInterval === 'function';
		let raf      = typeof global.requestAnimationFrame === 'function';

		if (raf === true && interval === true) {
			global.setInterval(_listeners.update, delta);
			global.requestAnimationFrame(_listeners.render);
		} else if (interval === true) {
			global.setInterval(_listeners.interval, delta);
		}



		if (lychee.debug === true) {

			let methods = [];

			if (interval) methods.push('setInterval');
			if (raf)      methods.push('requestAnimationFrame');

			if (methods.length === 0) {
				console.error('lychee.app.Loop: Supported methods are NONE');
			} else {
				console.info('lychee.app.Loop: Supported methods are ' + methods.join(', '));
			}

		}

	})((1000 / 60) | 0);



	/*
	 * HELPERS
	 */

	const _update_loop = function(clock) {

		if (this.__state !== 1) return;


		let delta = clock - this.__updateclock;
		if (delta >= this.__updatedelay) {

			this.trigger('update', [ clock, delta ]);


			for (let iid in this.__intervals) {

				let interval = this.__intervals[iid];

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


			for (let tid in this.__timeouts) {

				let timeout = this.__timeouts[tid];
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

	const _render_loop = function(clock) {

		if (this.__state !== 1) return;


		let delta = clock - this.__renderclock;
		if (delta >= this.__renderdelay) {

			this.trigger('render', [ clock, delta ]);


			this.__renderclock = clock;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


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

		_INSTANCES.push(this);

		settings = null;

	};


	Composite.prototype = {

		destroy: function() {

			let found = false;

			for (let i = 0, il = _INSTANCES.length; i < il; i++) {

				if (_INSTANCES[i] === this) {
					_INSTANCES.splice(i, 1);
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

			let data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.app.Loop';


			let settings = {};
			let blob     = (data['blob'] || {});


			if (this.update !== 40) settings.update = this.update;
			if (this.render !== 40) settings.render = this.render;


			if (Object.keys(this.__timeouts).length > 0) {

				blob.timeouts = [];

				for (let tid in this.__timeouts) {

					let timeout = this.__timeouts[tid];

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

				for (let iid in this.__intervals) {

					let interval = this.__intervals[iid];

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


			let id = _id++;

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


			let id = _id++;

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


	return Composite;

});

