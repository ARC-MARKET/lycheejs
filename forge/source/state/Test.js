
lychee.define('game.state.Test').requires([
	'lychee.ui.Slider'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.State.call(this, game, 'menu');

		this.__locked = false;

		this.reset();

	};


	Class.prototype = {

		reset: function() {

			var layer = new lychee.game.Layer();

			layer.addEntity(new lychee.ui.Slider({
				range: {
					from:  0,
					to:    100,
					delta: 1
				},
				radius: 100,
				position: {
					x: 200,
					y: 200
				},
				value: 20
			}));

			layer.addEntity(new lychee.ui.Slider({
				range: {
					from:  0,
					to:    360,
					delta: 10
				},
				radius: 50,
				position: {
					x: 500,
					y: 200
				},
				value: 90
			}));

			layer.addEntity(new lychee.ui.Slider({
				range: {
					from:  0,
					to:    360,
					delta: 10
				},
				radius: 50,
				position: {
					x: 800,
					y: 200
				},
				value: 90
			}));


			this.addLayer('ui', layer);

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);

/*
			this.__loop.interval(25, function(clock, delta) {

				var slider1 = this.__entities.slider1;
				var slider2 = this.__entities.slider2;

				var value1 = slider1.getValue() + 1;
				var value2 = slider2.getValue() + 1;

				slider1.setValue(value1);
				slider2.setValue(value2);

			}, this);
*/

		},

		leave: function() {

			lychee.game.State.prototype.leave.call(this);

		}

	};


	return Class;

});
