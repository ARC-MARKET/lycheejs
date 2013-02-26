
lychee.define('lychee.game.Loop').tags({
	platform: 'v8gl'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (
		typeof setInterval === 'function'
		&& global.glut !== undefined
		&& typeof global.glut.displayFunc === 'function'
	) {
		return true;
	}

	return false;

}).exports(function(lychee, global) {

	var _globalIntervalId = null,
		_timeoutId = 0,
		_intervalId = 0;


	if (lychee.debug === true) {
		console.log('lychee.game.Loop: Supported interval methods are setInterval(), glut.displayFunc()');
	}


	var Class = function(data) {

		var settings = lychee.extend({}, data);

		this.__timeouts = {};
		this.__intervals = {};

		lychee.event.Emitter.call(this, 'loop');


		this.reset(settings.update, settings.render);

		settings = null;

	};


	Class.prototype = {

		reset: function(updateFps, renderFps) {

			updateFps = typeof updateFps === 'number' ? updateFps : 0;
			renderFps = typeof renderFps === 'number' ? renderFps : 0;


			if (updateFps < 0) updateFps = 0;
			if (renderFps < 0) renderFps = 0;

			if (updateFps === 0 && renderFps === 0) {
				return false;
			}


			this.__clock = {
				start: Date.now(),
				update: 0,
				render: 0
			};


			this.__ms = {};

			if (updateFps > 0) this.__ms.update = 1000 / updateFps;
			if (renderFps > 0) this.__ms.render = 1000 / updateFps;


			this.__updateFps = updateFps;
			this.__renderFps = renderFps;


			this.__setup();


			return true;

		},

		start: function() {
			this.__state = 'running';
		},

		stop: function() {
			this.__state = 'stopped';
		},

		timeout: function(delta, callback, scope) {

			delta = typeof delta === 'number' ? delta : null;
			callback = callback instanceof Function ? callback : null;
			scope = scope !== undefined ? scope : global;


			if (delta === null || callback === null) {
				return null;
			}


			var id = _timeoutId++;
			this.__timeouts[id] = {
				start: this.__clock.update + delta,
				callback: callback,
				scope: scope
			};


			var that = this;
			return {
				clear: function() {
					that.__timeouts[id] = null;
				}
			};

		},

		interval: function(delta, callback, scope) {

			delta = typeof delta === 'number' ? delta : null;
			callback = callback instanceof Function ? callback : null;
			scope = scope !== undefined ? scope : global;


			if (delta === null || callback === null) {
				return null;
			}


			var id = _intervalId++;
			this.__intervals[id] = {
				start: this.__clock.update + delta,
				delta: delta,
				step: 0,
				callback: callback,
				scope: scope
			};


			var that = this;
			return {
				clear: function() {
					that.__intervals[id] = null;
				}
			};

		},



		/*
		 * PROTECTED API
		 */

		_renderLoop: function(clock) {

			if (this.__state !== 'running') return;


			var delta = clock - this.__clock.render;

			if (delta >= this.__ms.render) {
				this.trigger('render', [ clock, delta ]);
				this.__clock.render = clock;
			}

		},

		_updateLoop: function(clock) {

			if (this.__state !== 'running') return;


			var delta = clock - this.__clock.update;

			if (delta >= this.__ms.update) {
				this.trigger('update', [ clock, delta ]);
				this.__clock.update = clock;
			}


			var data;
			for (var iId in this.__intervals) {

				data = this.__intervals[iId];

				// Skip cleared intervals
				if (data === null) continue;

				var curStep = Math.floor((clock - data.start) / data.delta);
				if (curStep > data.step) {
					data.step = curStep;
					data.callback.call(data.scope, clock - data.start, curStep);
				}

			}


			for (var tId in this.__timeouts) {

				data = this.__timeouts[tId];

				// Skip cleared timeouts
				if (data === null) continue;

				if (clock >= data.start) {
					this.__timeouts[tId] = null;
					data.callback.call(data.scope, clock);
				}

			}

		},



		/*
		 * PRIVATE API
		 */

		__setup: function() {

			if (_globalIntervalId !== null) {
				global.clearInterval(_globalIntervalId);
			}


			this.__ms.min = 1000;

			if (this.__ms.update !== undefined) {
				this.__ms.min = Math.min(this.__ms.min, this.__ms.update);
			}

			if (this.__ms.render !== undefined) {
				this.__ms.min = Math.min(this.__ms.min, this.__ms.render);
			}


			var that = this;


			if (
				this.__ms.update !== undefined
				&& this.__ms.render !== undefined
			) {

				glut.displayFunc(function() {

					var clock = Date.now() - that.__clock.start;
					that._renderLoop(clock);

				});

				_globalIntervalId = global.setInterval(function() {

					var clock = Date.now() - that.__clock.start;
					that._updateLoop(clock);

					glut.postRedisplay();

				}, this.__ms.min);

			} else if (
				this.__ms.update !== undefined
			) {

				_globalIntervalId = global.setInterval(function() {

					var clock = Date.now() - that.__clock.start;
					that._updateLoop(clock);

				}, this.__ms.min);

			} else if (
				this.__ms.render !== undefined
			) {

				// Do nothing, can't render something
				// via GLUT without an update loop.

			}

		}

	};


	return Class;

});

