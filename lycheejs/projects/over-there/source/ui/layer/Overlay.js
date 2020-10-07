
lychee.define('app.ui.layer.Overlay').requires([
	'lychee.app.Entity',
	'lychee.effect.Alpha',
	'app.ui.entity.Bubble'
]).includes([
	'lychee.ui.Layer'
]).exports((lychee, global, attachments) => {

	const _Alpha  = lychee.import('lychee.effect.Alpha');
	const _Entity = lychee.import('lychee.app.Entity');
	const _Bubble = lychee.import('app.ui.entity.Bubble');
	const _Layer  = lychee.import('lychee.ui.Layer');
	const _SOUND  = attachments['snd'];



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.__entity = null;
		this.__orbit  = null;


		_Layer.call(this, states);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'app.ui.layer.Overlay';


			return data;

		},

		update: function(clock, delta) {

			_Layer.prototype.update.call(this, clock, delta);



			let entity = this.__entity;
			if (entity !== null) {

				this.position.x = entity.position.x;
				this.position.y = entity.position.y;

				let entities = this.entities;
				let pi2  = 2 * Math.PI / entities.length;
				let sec  = clock / 1300;
				let dist = this.__orbit + 64;

				for (let e = 0, el = entities.length; e < el; e++) {

					let other = entities[e];

					other.setPosition({
						x: Math.sin(sec + e * pi2) * dist,
						y: Math.cos(sec + e * pi2) * dist
					});

				}

			}

		},

		render: function(renderer, offsetX, offsetY) {

			let orbit = this.__orbit;
			if (orbit !== null) {

				let position = this.position;

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

			entity = lychee.interfaceof(_Entity, entity) ? entity : null;


			if (entity !== null) {

				let properties = entity.properties || null;
				if (properties !== null) {

					let entities = [];

					for (let key in properties) {

						let bubble = new _Bubble({
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


				_SOUND.play();
				this.__entity = entity;
				this.__orbit  = 64;

			} else {

				this.__entity = null;
				this.__orbit  = null;

			}


			return true;

		}

	};


	return Composite;

});

