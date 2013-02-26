
lychee.define('lychee.game.Main').requires([
	'lychee.game.Loop'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee) {

	var Class = function(settings) {

		this.settings = lychee.extend({}, this.defaults, settings);

		this.states = {};
		this.__state = null;

		lychee.event.Emitter.call(this, 'game');

	};


	Class.prototype = {

		defaults: {
			renderFps: 60,
			updateFps: 60,
			width: 1024,
			height: 768
		},

		load: function() {

			// Default behaviour:
			// Directly initialize, load no assets
			this.init();

		},

		init: function() {

			this.loop = new lychee.game.Loop({
				render: this.settings.renderFps,
				update: this.settings.updateFps
			});

			this.loop.bind('update', this.updateLoop, this);
			this.loop.bind('render', this.renderLoop, this);

		},

		start: function() {
			this.loop.start();
		},

		stop: function() {
			this.loop.stop();
		},

		getState: function(id) {

			id = typeof id === 'string' ? id : null;

			return this.states[id] || this.__state;

		},

		setState: function(id, data) {

			data = data || null;

			var oldState = this.__state;
			var newState = this.states[id] || null;

			// stupid called -.-
			if (newState === null) {
				return false;
			}

			if (oldState !== null) {
				oldState.leave && oldState.leave();
			}


			newState.enter && newState.enter(data);
			this.__state = newState;


			return true;

		},

		renderLoop: function(t, dt) {
			if (this.__state !== null) {
				this.__state.render && this.__state.render(t, dt);
			}
		},

		updateLoop: function(t, dt) {
			if (this.__state !== null) {
				this.__state.update && this.__state.update(t, dt);
			}
		}


	};


	return Class;

});

