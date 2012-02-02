
game.physics = function(settings, game) {

	this._game = game;

	// Initialize settings
	ly.physics.call(this, settings);

};


ly.extend(game.physics.prototype, ly.physics.prototype, {

	/*
	 * PRIVATE API
	 */
	__applyCollision: function(direction, delta, object, oObject) {

		var overallSpeed = Math.abs(object.speed[direction]) + Math.abs(oObject.speed[direction]),
			overallMass = object.get('mass') + oObject.get('mass'),
			speed = object.get('mass') / overallMass * overallSpeed,
			oSpeed = oObject.get('mass') / overallMass * overallSpeed;


			if (object.speed[direction] >= 0) {
				object.speed[direction] = -1 * speed;
			} else {
				object.speed[direction] = speed;
			}

			if (oObject.speed[direction] >= 0) {
				oObject.speed[direction] = -1 * oSpeed;
			} else {
				oObject.speed[direction] = oSpeed;
			}

	},



	/*
	 * PUBLIC API
	 */
	onCollision: function(delta, object, oObject) {

		// Player has jumped on an enemy
		if (
			object.id === 'player'
			&& oObject.enemy !== undefined
			&& delta.y > 0
		) {

			oObject.enemy.hit();
			return true;


		// Player was hit by a walking enemy
		}


		if (delta.x !== null) {

			if (object.id === 'player' && oObject.enemy !== undefined) {
				object.player.hit();
			}

			this.__applyCollision('x', delta.x, object, oObject);
			return true;

		}

		if (delta.y !== null) {

			if (oObject.get('type') === 'static') {

				object.speed.x = 0;
				object.speed.y = 0;

				return true;

			} else {
				this.__applyCollision('y', delta.x, object, oObject);
				return true;
			}

		}


		// true = objects stop
		// false = objects move further
		return false;

	}

});

