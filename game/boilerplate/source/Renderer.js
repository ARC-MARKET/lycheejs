
lychee.define('game.Renderer').requires([
	'game.entity.Circle',
	'game.entity.Text'
]).includes([
	'lychee.ui.Renderer'
]).exports(function(lychee, global) {

	var _circle = game.entity.Circle;
	var _text   = game.entity.Text;

	var Class = function(id) {

		lychee.ui.Renderer.call(this, id);

	};

	Class.prototype = {

		/*
		 * This is the central method that is called
		 * for each Entity in the game.
		 *
		 * To allow direct usage of lychee.ui.*,
		 * the method is called for backwards compatibility
		 */

		renderEntity: function(entity, offsetX, offsetY) {

			if (entity instanceof _circle) {

				this.renderCircle(entity);

			} else if (entity instanceof _text) {

				this.renderText(entity);

			} else {

				lychee.ui.Renderer.prototype.renderEntity.call(this, entity, offsetX, offsetY);

			}

		},



		/*
		 * CUSTOM RENDERING API
		 */

		renderCircle: function(entity) {

			var pos = entity.getPosition();

			this.drawCircle(
				pos.x, pos.y,
				entity.radius,
				'#ff0000',
				true
			);

		},

		renderText: function(entity) {

			var pos = entity.getPosition();

			this.drawText(
				pos.x, pos.y,
				entity.getText(),
				entity.getFont(),
				true
			);

		}

	};


	return Class;

});

