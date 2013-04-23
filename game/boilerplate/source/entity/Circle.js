
lychee.define('game.entity.Circle').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	var Class = function(settings) {

		settings.shape = lychee.ui.Entity.SHAPE.circle;

		lychee.ui.Entity.call(this, 'game-text', settings);

	};


	Class.prototype = {

	};


	return Class;

});

