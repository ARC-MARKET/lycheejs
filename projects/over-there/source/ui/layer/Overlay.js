
lychee.define('app.ui.layer.Overlay').requires([
	'lychee.effect.Alpha',
	'app.ui.entity.Bubble'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, global, attachments) {

	var _Alpha  = lychee.import('lychee.effect.Alpha');
	var _Bubble = lychee.import('app.ui.entity.Bubble');
	var _Layer  = lychee.import('lychee.ui.Layer');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.__entity = null;
		this.__orbit  = null;


		_Layer.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'app.ui.layer.Overlay';


			return data;

		},

		update: function(clock, delta) {

			_Layer.prototype.update.call(this, clock, delta);



			var entity = this.__entity;
			if (entity !== null) {

				this.position.x = entity.position.x;
				this.position.y = entity.position.y;

				var entities = this.entities;
				var pi2  = 2 * Math.PI / entities.length;
				var sec  = clock / 4000;
				var dist = this.__orbit + 64;

				for (var e = 0, el = entities.length; e < el; e++) {

					var other = entities[e];

					other.setPosition({
						x: Math.sin(sec + e * pi2) * dist,
						y: Math.cos(sec + e * pi2) * dist
					});

				}

			}

		},

		render: function(renderer, offsetX, offsetY) {

			var orbit = this.__orbit;
			if (orbit !== null) {

				var position = this.position;

				renderer.setAlpha(0.6);

				renderer.drawCircle(
					position.x + offsetX,
					position.y + offsetY,
					orbit + 64,
					'#0ba2ff',
					false,
					1
				);

				renderer.setAlpha(1);

			}


			_Layer.prototype.render.call(this, renderer, offsetX, offsetY);

		},



		/*
		 * CUSTOM API
		 */

		setEntity: function(entity) {

			entity = lychee.interfaceof(entity, lychee.app.Entity) ? entity : null;


			if (entity !== null) {

				var properties = entity.properties || null;
				if (properties !== null) {

					var entities = [];

					for (var key in properties) {

						var bubble = new _Bubble({
							key:   key,
							value: properties[key]
						});


						bubble.alpha = 0;
						bubble.addEffect(new _Alpha({
							type:     _Alpha.TYPE.easeout,
							duration: 600,
							delay:    entities.length * 200
						}));

						entities.push(bubble);

					}

					this.setEntities(entities);

				} else {

					this.entities = [];

				}


				this.__entity = entity;
				this.__orbit  = 64;

			} else {

				this.__orbit = null;

			}

		}

	};


	return Class;

});

