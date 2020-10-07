
lychee.define('game.app.entity.Vesicle').requires([
	'lychee.effect.Color'
]).includes([
	'lychee.app.Entity'
]).exports((lychee, global, attachments) => {

	const _Color   = lychee.import('lychee.effect.Color');
	const _Entity  = lychee.import('lychee.app.Entity');
	let   _id      = 0;
	const _FONT    = attachments['fnt'];
	const _PALETTE = {
		immune:  '#32afe5',
		virus:   '#d0494b',
		neutral: '#efefef'
	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.id     = 'vesicle-' + _id++;
		this.color  = '#efefef';
		this.font   = _FONT;
		this.team   = 'neutral';
		this.damage = 0;
		this.health = 100;

		this.__attacker = null;
		this.__health   = this.health;


		this.setColor(states.color);
		this.setHealth(states.health);

		delete states.color;
		delete states.health;


		states.collision = _Entity.COLLISION.A;
		states.shape     = _Entity.SHAPE.circle;
		states.radius    = 16;


		_Entity.call(this, states);



		/*
		 * INITIALIZATION
		 */

		this.setTeam(states.team);


		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (typeof blob.color === 'string' && /(#[AaBbCcDdEeFf0-9]{6})/g.test(blob.color)) {
				this.color = blob.color;
			}

			if (typeof blob.attacker === 'string') {
				this.__attacker = blob.attacker;
			}

			if (typeof blob.health === 'number') {
				this.__health = blob.health;
			}

		},

		serialize: function() {

			let data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'game.app.entity.Vesicle';

			let states = data['arguments'][0];
			let blob   = (data['blob'] || {});


			if (this.team !== 'neutral') states.team   = this.team;
			if (this.health !== 100)     states.health = this.health;


			if (this.color !== _PALETTE.neutral) blob.color    = this.color;
			if (this.__attacker !== null)        blob.attacker = this.__attacker;
			if (this.__health !== 100)           blob.health   = this.__health;


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			let color    = this.color;
			let font     = this.font;
			let position = this.position;
			let radius   = this.radius;


			renderer.drawCircle(
				position.x + offsetX,
				position.y + offsetY,
				radius + 2,
				_PALETTE.neutral,
				true
			);

			renderer.drawCircle(
				position.x + offsetX,
				position.y + offsetY,
				radius,
				color,
				true
			);


			let id = this.id.substr('vesicle-'.length);
			if (id.length > 0) {

				renderer.drawText(
					position.x + offsetX,
					position.y + offsetY,
					'#' + id,
					font,
					true
				);

			}

		},



		/*
		 * CUSTOM API
		 */

		damage: function(team, damage) {

			team   = typeof team === 'string'   ? team         : null;
			damage = typeof damage === 'number' ? (damage | 0) : null;


			if (team !== null && damage !== null) {

				if (team !== this.team) {

					this.health     = Math.max(0, this.health - damage);
					this.__attacker = team;


					if (this.health === 0) {

						this.health     = this.__health;
						this.team       = team;
						this.__attacker = null;

					}

					return true;

				}

			}


			return false;

		},

		setColor: function(color) {

			color = /(#[AaBbCcDdEeFf0-9]{6})/g.test(color) ? color : null;


			if (color !== null) {

				this.color = color;

				return true;

			}


			return false;

		},

		setHealth: function(health) {

			health = typeof health === 'number' ? (health | 0) : null;


			if (health !== null) {

				this.health   = health;
				this.__health = health;

				return true;

			}


			return false;

		},

		setTeam: function(team) {

			team = typeof team === 'string' ? team : null;


			if (team !== null) {

				if (team !== this.team) {

					this.addEffect(new _Color({
						type:     _Color.TYPE.easeout,
						color:    _PALETTE[team] || _PALETTE.neutral,
						delay:    0,
						duration: 1000
					}));

				}

				this.team = team;

				return true;

			}


			return false;

		},

		isAttackedBy: function(team) {

			team = typeof team === 'string' ? team : null;


			if (this.__attacker === team) {
				return true;
			}


			return false;

		}

	};


	return Composite;

});

