
lychee.define('lychee.verlet.Particle').requires([
	'lychee.math.Vector2'
]).exports(function(lychee, global, attachments) {

	var _Vector2 = lychee.import('lychee.math.Vector2');


	var Class = function(position) {

		this.position     = new _Vector2();
		this.lastposition = new _Vector2();

		this.setPosition(position);

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		render: function(renderer, offsetX, offsetY) {

			var position = this.position;

			var x = position.x + offsetX;
			var y = position.y + offsetY;

			renderer.drawCircle(
				x,
				y,
				2,
				'#ff0000',
				true
			);

		},


		/*
		 * GETTERS AND SETTERS
		 */

		setPosition: function(position) {

			if (position instanceof Object) {

				this.position.x = typeof position.x === 'number' ? position.x : this.position.x;
				this.position.y = typeof position.y === 'number' ? position.y : this.position.y;

				this.lastposition.x = this.position.x;
				this.lastposition.y = this.position.y;

				return true;

			}


			return false;

		}

	};


	return Class;

});

