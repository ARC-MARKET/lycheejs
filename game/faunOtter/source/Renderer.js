
lychee.define('game.Renderer').includes([
	'lychee.ui.Renderer'
]).exports(function(lychee, global) {

	var Class = function(id) {

		lychee.ui.Renderer.call(this, id);

	};

	Class.prototype = {

		renderText: function(entity) {

			var pos = entity.getPosition();

			this.drawText(
				pos.x, pos.y,
				entity.getText(),
				entity.getFont(),
				true
			);

		},

		renderEntity: function(entity) {

				// Center of gravity-offset 
			var dx 		= entity.radius || entity.width / 2;
			var dy 		= entity.radius || entity.height / 2;
			
			var pos 	= entity.getPosition();
			var image 	= entity.getImage();


			this.drawSprite(
				pos.x - dx, 
				pos.y - dy, 
				image
				);

		}

	};


	return Class;

});

