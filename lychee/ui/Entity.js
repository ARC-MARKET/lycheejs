
lychee.define('lychee.ui.Entity').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global) {

	var Class = function(id, data) {

		var settings = lychee.extend({}, data);


		this.width  = typeof settings.width === 'number' ? settings.width : 0;
		this.height = typeof settings.height === 'number' ? settings.height : 0;
		this.radius = typeof settings.radius === 'number' ? settings.radius : 0;


		this.__clock      = null;
		this.__opacity    = 0;
		this.__position   = { x: 0, y: 0 };
		this.__shape      = Class.SHAPE.rectangle;
		this.__state      = 'default';
		this.__states     = { 'default' : null };
		this.__visibility = {
			active:   false,
			start:    null,
			duration: 0,
			from:     0,
			to:       0
		};


		if (settings.states instanceof Object) {

			for (var id in settings.states) {
				if (settings.states.hasOwnProperty(id)) {
					this.__states[id] = settings.states[id];
				}
			}

		}


		this.setPosition(settings.position);
		this.setShape(settings.shape);
		this.setState(settings.state);


		lychee.event.Emitter.call(this, id);

		settings = null;

	};


	// Same ENUM values as lychee.game.Entity
	Class.SHAPE = {
		circle:    0,
		rectangle: 2
	};


	Class.prototype = {

		// Allows sync(null, true) for reset
		sync: function(clock, force) {

			force = force === true;

			if (force === true) {
				this.__clock = clock;
			}


			if (this.__clock === null) {


				if (this.__visibility.active === true && this.__visibility.start === null) {
					this.__visibility.start = clock;
				}

				this.__clock = clock;

			}

		},

		update: function(clock, delta) {

			// 1. Sync clocks initially
			// (if Entity was created before loop started)
			if (this.__clock === null) {
				this.sync(clock);
			}


			// 2. Visibility (show/hide)
			var visibility = this.__visibility;

			if (
				visibility.active === true
				&& visibility.start !== null
			) {

				var t = (this.__clock - visibility.start) / visibility.duration;

				if (t <= 1) {
					this.__opacity = visibility.from + t * (visibility.to - visibility.from);
				} else {
					this.__opacity = visibility.to;
					visibility.active = false;
				}

			}


			this.__clock = clock;

		},

		show: function(duration) {

			duration = typeof duration === 'number' ? duration : 500;


			var visibility = this.__visibility;

			visibility.active   = true;
			visibility.start    = this.__clock;
			visibility.duration = duration;
			visibility.from     = this.__opacity;
			visibility.to       = 1;

		},

		hide: function(duration) {

			duration = typeof duration === 'number' ? duration : 500;


			var visibility = this.__visibility;

			visibility.active   = true;
			visibility.start    = this.__clock;
			visibility.duration = duration;
			visibility.from     = this.__opacity;
			visibility.to       = 0;

		},

		isVisible: function() {
			return this.__opacity > 0;
		},

		getOpacity: function() {
			return this.__opacity;
		},

		getPosition: function() {
			return this.__position;
		},

		setPosition: function(position) {

			if (position instanceof Object) {

				this.__position.x = typeof position.x === 'number' ? position.x : this.__position.x;
				this.__position.y = typeof position.y === 'number' ? position.y : this.__position.y;

				return true;

			}


			return false;

		},

		getStateMap: function() {
			return this.__states[this.__state];
		},

		getState: function() {
			return this.__state;
		},

		setState: function(id) {

			id = typeof id === 'string' ? id : null;

			if (id !== null && this.__states[id] !== undefined) {
				this.__state = id;
				return true;
			}


			return false;

		},

		getShape: function() {
			return this.__shape;
		},

		setShape: function(shape) {

			if (typeof shape !== 'number') return false;


			var found = false;

			for (var id in Class.SHAPE) {

				if (shape === Class.SHAPE[id]) {
					found = true;
					break;
				}

			}


			if (found === true) {
				this.__shape = shape;
			}


			return found;

		}

	};


	return Class;

});

