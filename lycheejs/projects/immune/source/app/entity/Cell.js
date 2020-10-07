
lychee.define('game.app.entity.Cell').requires([
	'game.app.entity.Vesicle'
]).includes([
	'lychee.app.Entity'
]).exports((lychee, global, attachments) => {

	const _Entity  = lychee.import('lychee.app.Entity');
	const _Vesicle = lychee.import('game.app.entity.Vesicle');
	let   _id      = 0;
	const _COLORS  = {
		immune:  '#32afe5',
		neutral: '#efefef',
		virus:   '#d0494b'
	};
	const _FONTS   = {
		immune:  attachments['immune.fnt'],
		neutral: attachments['neutral.fnt'],
		virus:   attachments['virus.fnt']
	};



	/*
	 * HELPERS
	 */

	const _closest_vesicle = function(position, a, b) {

		let dist_a = Math.pow(position.x - a.position.x, 2) + Math.pow(position.y - a.position.y, 2);
		let dist_b = Math.pow(position.x - b.position.x, 2) + Math.pow(position.y - b.position.y, 2);


		if (dist_a < dist_b) {
			return a;
		} else {
			return b;
		}

	};

	const _reset_vesicles = function(team) {

		let radius   = this.radius;
		let vesicles = this.vesicles;
		let health   = this.__health;


		let theta = 2 * Math.PI / vesicles.length;

		for (let v = 0, vl = vesicles.length; v < vl; v++) {

			let vesicle = vesicles[v];
			if (vesicle !== null) {

				let position = {
					x: Math.sin(theta * v) * radius,
					y: Math.cos(theta * v) * radius
				};


				vesicle.setHealth(health);
				vesicle.setTeam(team);
				vesicle.setPosition(position);

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.id       = 'cell-' + _id++;
		this.team     = 'neutral';
		this.damage   = 0;
		this.health   = 100;
		this.vesicles = [
			new _Vesicle(),
			new _Vesicle(),
			new _Vesicle(),
			new _Vesicle(),
			new _Vesicle(),
			new _Vesicle(),
			new _Vesicle(),
			new _Vesicle()
		];

		this.__attacker = null;
		this.__health   = this.health;


		this.setHealth(states.health);
		this.setTeam(states.team);
		this.setVesicles(states.vesicles);


		delete states.health;
		delete states.team;
		delete states.vesicles;


		states.collision = _Entity.COLLISION.A;
		states.shape     = _Entity.SHAPE.circle;
		states.radius    = states.radius || 128;


		_Entity.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		_reset_vesicles.call(this, this.team);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (typeof blob.attacker === 'string') {
				this.__attacker = blob.attacker;
			}

			if (typeof blob.health === 'number') {
				this.__health = blob.health;
			}

			if (blob.vesicles instanceof Array) {

				for (let v = 0, vl = blob.vesicles.length; v < vl; v++) {
					this.vesicles[v] = lychee.deserialize(blob.vesicles[v]);
				}

			}

		},

		serialize: function() {

			let data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'game.app.entity.Cell';

			let states = data['arguments'][0];
			let blob   = (data['blob'] || {});


			if (this.health !== 100)     states.health = this.health;
			if (this.team !== 'neutral') states.team   = this.team;


			if (this.__attacker !== null) blob.attacker = this.__attacker;
			if (this.__health !== 100)    blob.health   = this.__health;


			if (this.vesicles.length > 0) {
				blob.vesicles = this.vesicles.map(lychee.serialize);
			}


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			let position = this.position;
			let radius   = this.radius;
			let team     = this.team;

			let x     = position.x + offsetX;
			let y     = position.y + offsetY;
			let color = _COLORS[team] || _COLORS.neutral;
			let font  = _FONTS[team]  || _FONTS.neutral;
			let text  = '' + Math.min(100, this.health / this.__health * 100).toFixed(2) + '%';


			renderer.drawCircle(
				x,
				y,
				radius,
				color,
				false,
				radius / 10
			);


			renderer.drawText(
				x,
				y,
				text,
				font,
				true
			);


			let vesicles = this.vesicles;
			for (let v = 0, vl = vesicles.length; v < vl; v++) {

				let vesicle = vesicles[v];
				if (vesicle !== null) {
					vesicle.render(renderer, x, y);
				}
			}

		},

		update: function(clock, delta) {

			_Entity.prototype.update.call(this, clock, delta);


			let team     = this.team;
			let radius   = this.radius;
			let immune   = 0;
			let neutral  = 0;
			let virus    = 0;
			let vesicles = this.vesicles;
			let theta    = 2 * Math.PI / vesicles.length;

			for (let v = 0, vl = vesicles.length; v < vl; v++) {

				let vesicle = vesicles[v];
				if (vesicle !== null) {

					if (vesicle.team === 'neutral') {
						neutral++;
					} else if (vesicle.team === 'immune') {
						immune++;
					} else if (vesicle.team === 'virus') {
						virus++;
					}

					vesicle.position.x = Math.sin(theta * v) * radius;
					vesicle.position.y = Math.cos(theta * v) * radius;

					vesicle.update(clock, delta);

				}

			}


			if (immune + neutral > virus) {
				team = 'immune';
			} else if (virus > immune + neutral) {
				team = 'virus';
			}


			if (team !== this.team) {

				// TODO: Algorithm above is defunct
				// _reset_vesicles.call(this, team);

				// this.team = team;

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

				this.team = team;

				let vesicles = this.vesicles;
				for (let v = 0, vl = vesicles.length; v < vl; v++) {

					let vesicle = vesicles[v];
					if (vesicle !== null) {
						vesicle.setTeam(team);
					}
				}

				return true;

			}


			return false;

		},

		setVesicles: function(vesicles) {

			vesicles = vesicles instanceof Array ? vesicles : null;


			if (vesicles !== null) {

				this.vesicles = vesicles.map(vesicle => vesicle instanceof _Vesicle ? vesicle : null);

				return true;

			}


			return false;

		},

		getVesicle: function(team, position) {

			team     = typeof team === 'string'   ? team     : null;
			position = position instanceof Object ? position : null;


			let found = null;

			if (team !== null) {

				let vesicles = this.vesicles;

				if (position !== null) {

					for (let v = 0, vl = vesicles.length; v < vl; v++) {

						let vesicle = vesicles[v];
						if (vesicle !== null && vesicle.team === team && found !== null) {
							found = _closest_vesicle(position, vesicle, found);
						} else if (vesicle !== null && vesicle.team === team) {
							found = vesicle;
						}

					}

				} else {

					for (let v = 0, vl = vesicles.length; v < vl; v++) {

						let vesicle = vesicles[v];
						if (vesicle !== null && vesicle.team === team) {
							found = vesicle;
							break;
						}

					}

				}

			} else {

				let vesicles = this.vesicles;

				if (position !== null) {

					for (let v = 0, vl = vesicles.length; v < vl; v++) {

						let vesicle = vesicles[v];
						if (vesicle !== null && found !== null) {
							found = _closest_vesicle(position, vesicle, found);
						} else if (vesicle !== null) {
							found = vesicle;
						}

					}

				} else {

					for (let v = 0, vl = vesicles.length; v < vl; v++) {

						let vesicle = vesicles[v];
						if (vesicle !== null) {
							found = vesicle;
							break;
						}

					}

				}

			}


			return found;

		},

		isAttackedBy: function(team) {

			team = typeof team === 'string' ? team : null;


			let result = false;

			if (team !== null) {

				let vesicles = this.vesicles;

				for (let v = 0, vl = vesicles.length; v < vl; v++) {

					let vesicle = vesicles[v];
					if (vesicle !== null && vesicle.isAttackedBy(team) === true) {
						result = true;
						break;
					}

				}

				if (result === false) {
					result = this.__attacker === team;
				}

			}

			return result;

		}

	};


	return Composite;

});

