
lychee.define('game.state.Game').requires([
	'game.entity.Circle',
	'game.entity.Text'
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

			var width = this.game.settings.width;
			var height = this.game.settings.height;


			this.removeLayer('ui');


			var layer = new lychee.game.Layer();


			layer.addEntity(new game.entity.Text({
				text: 'Game State active',
				font:  this.game.fonts.headline,
				position: {
					x: width / 2,
					y: height / 2 - 50
				}
			}));

			layer.addEntity(new game.entity.Text({
				text: 'Touch the circle to make Noise',
				font:  this.game.fonts.small,
				position: {
					x: width / 2,
					y: height / 2
				}
			}));



			/*
			 * Entities with event bindings
			 *
			 * IMPORTANT: Only lychee.ui.Entity
			 * instances can bind/trigger events
			 *
			 */

			var circle = new game.entity.Circle({
				radius: 50,
				position: {
					x: width / 2,
					y: height / 2 + 100
				}
			});

			circle.bind('touch', function() {

				// Shows typical State and Game Loop interaction
				if (this.__locked === true) return;

				if (this.game.settings.sound === true) {
					this.game.jukebox.play('click');
				}

			}, this);

			layer.addEntity(circle);


			var exit = new game.entity.Text({
				text: 'Exit to Menu',
				font:  this.game.fonts.small,
				position: {
					x: width / 2,
					y: height - 50
				}
			});

			exit.bind('touch', function() {
				this.game.setState('menu');
			}, this);

			layer.addEntity(exit);


			this.addLayer('ui', layer);

		},

		enter: function() {

			this.__locked = true;

			this.loop.timeout(1000, function() {
				this.__locked = false;
			}, this);


			lychee.game.State.prototype.enter.call(this);

		},

		leave: function() {

			this.__locked = true;

		}

	};


	return Class;

});
