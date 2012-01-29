
game.camera = function(settings, view) {

	this.settings = {};

	for (var d in this.defaults) {
		this[d] = this.defaults[d];
	}

	if (Object.prototype.toString.call(settings) === '[object Object]') {
		for (var s in settings) {
			this.settings[s] = settings[s];
		}
	}


	var func = this.settings.func;
	if (
		typeof func === 'string'
		&& this.FUNCTIONS[func] instanceof Function
	) {
		this.settings.func = this.FUNCTIONS[func];
	} else {
		this.settings.func = this.FUNCTIONS.linear;
	}


	this.__view = view;
	this.__following = undefined;

};



game.camera.prototype = {

	defaults: {
		duration: 500,
		func: 'linear'
	},

	/*
	 * PUBLIC API
	 */
	refresh: function(delta) {

		var animation,
			now = Date.now();

		if (
			this.__animation === undefined
			&& this.__following !== undefined
		) {

			var object = this.__following,
				viewport = this.__view.get('viewport'),
				boundaries = this.boundaries,
				center = viewport.position;


			var needsXShift = (
				object.position.x > (center.x + viewport.size.x * 0.25)
				|| object.position.x < (center.x - viewport.size.x * 0.25)
			);

			if (needsXShift === true) {

				animation = {
					start: now,
					end: now + this.settings.duration,
					direction: 'x',
					from: {
						x: center.x,
						y: center.y,
						z: center.z
					},
					to: {
						x: object.position.x,
						y: object.position.y,
						z: object.position.z
					}
				};

				this.__animation = animation;

			}

		} else if (this.__animation !== undefined) {


			if (now > this.__animation.end) {
				this.__animation = undefined;
				return;
			}


			animation = this.__animation;


			var t = (now - animation.start) / this.settings.duration,
				func = this.settings.func,
				dir = animation.direction,
				distance = animation.to[dir] - animation.from[dir];


			var target = {};
			target[dir] = animation.from[dir] + func(t) * distance;

			this.__view.shiftTo(target);

		}

	},

	follow: function(object) {

		if (object instanceof ly.object) {
			this.__following = object;
		} else {
			this.__following = undefined;
		}

	},

	isFollowing: function() {
		return !!this.__following;
	},

	FUNCTIONS: {

		'linear': function(t) {
			return t;
		},

		// CUBIC-based easing
		'ease-in': function(t) {
			return 1 * Math.pow(t, 3);
		},

		'ease-out': function(t) {
			return Math.pow(t - 1, 3) + 1;
		},

		'ease-in-out': function(t) {

			if ((t /= 0.5) < 1) {
				return 0.5 * Math.pow(t, 3);
			}

			return 0.5 * (Math.pow(t - 2, 3) + 2);

		},

		// SINUS-based easing
		'sin-ease-in': function(t) {
			return -1 * Math.cos(t * Math.PI / 2 ) + 1;
		},

		'sin-ease-out': function(t) {
			return 1 * Math.sin(t * Math.PI / 2);
		}

	}

};
