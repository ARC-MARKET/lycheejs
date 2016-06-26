
lychee.define('lychee.verlet.World').requires([
	'lychee.verlet.Vector2'
]).exports(function(lychee, global) {

	var _vector2 = lychee.verlet.Vector2;


	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.width   = 0;
		this.height  = 0;
		this.objects = [];

		this.__friction       = 0.99;
		this.__gravity        = new _vector2();
		this.__groundfriction = 0.8;
		this.__map            = {};
		this.__velocity       = new _vector2();


		this.setWidth(settings.width);
		this.setHeight(settings.height);


		this.setFriction(settings.friction);
		this.setGravity(settings.gravity);
		this.setGroundFriction(settings.groundfriction);


		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var settings = {};
			var blob     = {};


			if (this.width  !== 0) settings.width  = this.width;
			if (this.height !== 0) settings.height = this.height;


			if (this.__friction !== 0.99)      settings.friction       = (1 - this.__friction);
			if (this.__gravity.y !== 0)        settings.gravity        = this.__gravity.y;
			if (this.__groundfriction !== 0.8) settings.groundfriction = (1 - this.__groundfriction);


			return {
				'constructor': 'lychee.verlet.World',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		update: function(clock, delta) {

			var friction       = this.__friction;
			var groundfriction = this.__groundfriction;
			var gravity        = this.__gravity;
			var velocity       = this.__velocity;


			var hwidth  = this.width  / 2;
			var hheight = this.height / 2;


			for (var o = 0, ol = this.objects.length; o < ol; o++) {

				var object = this.objects[o];

				for (var p = 0, pl = object.particles.length; p < pl; p++) {

					var particle = object.particles[p];

					var position = particle.position;
					var lastposition = particle.lastposition;


					position.copy(velocity);
					velocity.subtract(lastposition);
					velocity.scale(friction);


					if (position.y >= hheight && velocity.squaredLength() > 0.000001) {

						var m = velocity.length();

						velocity.x /= m;
						velocity.y /= m;

						velocity.scale(m * groundfriction);

					}


					position.copy(lastposition);
					position.add(gravity);
					position.add(velocity);


					if (position.y > hheight) {
						position.y = hheight;
					}

				}

			}

		},

		render: function(clock, delta) {

		},


		setWidth: function(width) {

			width = typeof width === 'number' ? width : null;


			if (width !== null) {

				this.width = width;

				return true;

			}


			return false;

		},

		setHeight: function(height) {

			height = typeof height === 'number' ? height : null;


			if (height !== null) {

				this.height = height;

				return true;

			}


			return false;

		},



		/*
		 * CUSTOM API
		 */

		addObject: function(object) {

			object = (object instanceof Object && typeof object.update === 'function') ? object : null;


			if (object !== null) {

				var found = false;
				for (var o = 0, ol = this.objects.length; o < ol; o++) {

					var cached = this.objects[o];
					if (cached === object) {
						found = true;
						break;
					}

				}


				if (found === false) {

					this.objects.push(object);

					return true;

				}

			}


			return false;

		},

		setObject: function(id, object) {

			id     = typeof id === 'string'                                            ? id     : null;
			object = (object instanceof Object && typeof object.update === 'function') ? object : null;


			if (id !== null && object !== null) {

				if (this.__map[id] === undefined) {

					this.__map[id] = object;
					this.addObject(object);

					return true;

				}

			}


			return false;

		},

		getObject: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && this.__map[id] !== undefined) {
				return this.__map[id];
			}


			return null;

		},

		removeObject: function(object) {

			object = (object instanceof Object && typeof object.update === 'function') ? object : null;


			if (object !== null) {

				var found = false;

				for (var o = 0, ol = this.objects.length; o < ol; o++) {

					var cached = this.objects[o];
					if (cached === object) {
						this.objects.splice(o, 1);
						found = true;
						ol--;
						o--;
					}

				}


				for (var id in this.__map) {

					var mapped = this.__map[id];
					if (mapped === object) {
						delete this.__map[id];
						found = true;
					}

				}


				return found;

			}


			return false;

		},

		setFriction: function(friction) {

			if (typeof friction === 'number') {

				if (friction > 0 && friction < 1) {

					this.__friction = 1 - friction;

					return true;

				}

			}


			return false;

		},

		setGravity: function(gravity) {

			if (typeof gravity === 'number') {

				this.__gravity.set(0, gravity);

				return true;

			}


			return false;

		},

		setGroundFriction: function(friction) {

			if (typeof friction === 'number') {

				if (friction > 0 && friction < 1) {

					this.__groundfriction = 1 - friction;

					return true;

				}

			}


			return false;

		}

	};


	return Class;

});

