
lychee.define('lychee.game.State').requires([
	'lychee.game.Entity',
	'lychee.game.Layer'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global) {

	var _layer = lychee.game.Layer;
	var _shape = lychee.game.Entity.SHAPE;


	/*
	 * PRIVATE HELPER
	 */

	var _triggerEntityAtPosition = function(entity, pos, event, data) {

		var x = pos.x;
		var y = pos.y;


		if (typeof entity.trigger === 'function') {

			var position = entity.getPosition();
			var shape    = entity.getShape();
			if (shape === _shape.circle) {

				var dx = position.x - x;
				var dy = position.y - y;

				var distance = Math.sqrt(dx * dx + dy * dy);
				if (distance < entity.radius) {
					entity.trigger(event, data);
				}

			} else if (shape === _shape.rectangle) {

				var x1 = position.x - entity.width / 2;
				var x2 = position.x + entity.width / 2;
				var y1 = position.y - entity.height / 2;
				var y2 = position.y + entity.height / 2;

				if (
					x >= x1 && x <= x2
					&& y >= y1 && y <= y2
				) {
					entity.trigger(event, data);
				}

			}

		}

	};


	var Class = function(game, id) {

		this.game     = game;
		this.id       = id;

		this.input    = game.input || null;
		this.loop     = game.loop || null;
		this.renderer = game.renderer || null;

		this.__layers = {};

		lychee.event.Emitter.call(this, 'state-' + id);

	};

	Class.prototype = {

		/*
		 * STATE API
		 */

		enter: function() {

			this.trigger('enter');

			var input = this.input;
			if (input !== null) {
				input.bind('touch', this.__processTouch, this);
				input.bind('swipe', this.__processSwipe, this);
			}

			var renderer = this.renderer;
			if (renderer !== null) {
				renderer.start();
			}

		},

		leave: function() {

			var renderer = this.renderer;
			if (renderer !== null) {
				renderer.stop();
			}

			var input = this.input;
			if (input !== null) {
				input.unbind('swipe', this.__processSwipe, this);
				input.unbind('touch', this.__processTouch, this);
			}

			this.trigger('leave');

		},

		update: function(clock, delta) {

			for (var id in this.__layers) {

				var layer = this.__layers[id];
				if (layer.isVisible() === false) continue;


				var entities = layer.getEntities();
				for (var e = 0, el = entities.length; e < el; e++) {
					entities[e].update(clock, delta);
				}

			}

		},

		render: function(clock, delta) {

			var renderer = this.renderer;

			if (renderer !== null) {

				renderer.clear();

				for (var id in this.__layers) {

					var layer = this.__layers[id];
					if (layer.isVisible() === false) continue;


					var entities = layer.getEntities();
					for (var e = 0, el = entities.length; e < el; e++) {
						renderer.renderEntity(entities[e]);
					}

				}

				renderer.flush();

			}

		},



		/*
		 * LAYER API
		 */

		addLayer: function(id, layer) {

			id = typeof id === 'string' ? id : null;

			if (id !== null && layer instanceof _layer) {
				this.__layers[id] = layer;
				return true;
			}


			return false;

		},

		getLayer: function(id) {

			id = typeof id === 'string' ? id : null;

			if (id !== null && this.__layers[id] !== undefined) {
				return this.__layers[id];
			}


			return null;

		},

		removeLayer: function(id) {

			id = typeof id === 'string' ? id : null;

			if (id !== null && this.__layers[id] !== undefined) {
				delete this.__layers[id];
				return true;
			}


			return false;

		},



		/*
		 * PRIVATE API
		 */

		__processSwipe: function(id, type, position, delta, swipe) {

			if (this.renderer !== null) {

				var offset = this.renderer.getEnvironment().offset;

				position.x -= offset.x;
				position.y -= offset.y;

			}


			var originalX = position.x;
			var originalY = position.y;

			var data = [ id, type, {
				x: position.x,
				y: position.y
			}, delta, swipe ];


			for (var id in this.__layers) {

				var layer = this.__layers[id];
				if (layer.isVisible() === false) continue;


				var entities = layer.getEntities();
				for (var e = 0, el = entities.length; e < el; e++) {

					var entity    = entities[e];
					var eposition = entity.getPosition();

					data[2].x = originalX - eposition.x;
					data[2].y = originalY - eposition.y;


					_triggerEntityAtPosition(
						entity,
						position,
						'swipe',
						data
					);

				}

			}

		},

		__processTouch: function(id, position, delta) {

			if (this.renderer !== null) {

				var offset = this.renderer.getEnvironment().offset;

				position.x -= offset.x;
				position.y -= offset.y;

			}


			for (var id in this.__layers) {

				var layer = this.__layers[id];
				if (layer.isVisible() === false) continue;


				var entities = layer.getEntities();
				for (var e = 0, el = entities.length; e < el; e++) {

					_triggerEntityAtPosition(
						entities[e],
						position,
						'touch',
						null
					);

				}

			}

		}

	};


	return Class;

});

