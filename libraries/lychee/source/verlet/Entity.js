
lychee.define('lychee.verlet.Entity').requires([
	'lychee.math.Vector3'
]).includes([
	'lychee.app.Entity'
]).exports(function(lychee, global, attachments) {

	var _Entity  = lychee.import('lychee.app.Entity');
	var _Vector3 = lychee.import('lychee.math.Vector3');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		// TODO: this.__constraints
		// TODO: this.__segments


		_Entity.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'lychee.verlet.Entity';


			if (this.position.length() > 0) settings.position = lychee.serialize(this.position);


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setPosition: function(position) {

			position = position instanceof _Vector3 ? position : new _Vector3(position);


			if (position !== null) {

				this.position = position;

				return true;

			}


			return false;

		},

		setShape: function(shape) {

			shape = lychee.enumof(Class.SHAPE, shape) ? shape : null;


			if (shape !== null) {

				// TODO: Update collision model for verlet.Layer
				// TODO: DistanceConstraint for sphere/circle
				// TODO: DistanceConstraint for rectangle/cuboid shape

				this.shape = shape;

				return true;

			}


			return false;


		}

	};


	return Class;

});

