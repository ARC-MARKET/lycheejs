
lychee.define('game.state.Menu').requires([
	'game.app.entity.Cell',
	'game.app.entity.Unit',
	'game.app.entity.Vesicle',
	'lychee.app.Layer',
	'lychee.ui.Layer',
	'lychee.ui.entity.Button',
	'lychee.ui.entity.Label'
]).includes([
	'lychee.app.State'
]).exports((lychee, global, attachments) => {

	const _State     = lychee.import('lychee.app.State');
	const _BLOB      = attachments['json'].buffer;
	const _CAMPAIGNS = _BLOB.campaigns;
	const _PALETTE   = {
	};



	/*
	 * HELPERS
	 */

	const _fade_text = function(text) {
	};

	const _move_unit = function(id, position, delta) {

		let confirm = this.query('ui > confirm');
		if (confirm !== null && confirm.confines(position)) {
			return;
		}


		let unit = this.query('game > unit');
		if (unit !== null && unit.isIdle()) {

			let cells = [
				this.query('game > immune'),
				this.query('game > virus'),
				this.query('game > neutral')
			].filter(cell => cell !== null);
			let found = null;
			let fdist = Infinity;

			for (let c = 0, cl = cells.length; c < cl; c++) {

				let cell = cells[c];
				let dist = Math.pow(position.x - cell.position.x, 2) + Math.pow(position.y - cell.position.y, 2);
				if (dist < fdist) {
					found = cell;
					fdist = dist;
				}

			}


			if (found !== null) {

				let headline = this.query('ui > headline');
				let subtitle = this.query('ui > subtitle');
				let campaign = null;
				let team     = unit.team;

				if (headline !== null) {

					// Immune Campaign
					if (found === cells[0]) {

						headline.setValue('Immune Campaign');
						campaign = _CAMPAIGNS.immune;
						team     = 'immune';

					// Virus Campaign
					} else if (found === cells[1]) {

						headline.setValue('Virus Campaign');
						campaign = _CAMPAIGNS.virus;
						team     = 'virus';

					// Settings
					} else if (found === cells[2]) {

						headline.setValue('Neutral Campaign');
						campaign = _CAMPAIGNS.neutral;
						team     = 'neutral';

					}

				}


				let vesicle = found.getVesicle(found.team, {
					x: position.x - found.position.x,
					y: position.y - found.position.y
				});

				if (vesicle !== null) {

					if (campaign !== null && subtitle !== null) {

						let index = found.vesicles.indexOf(vesicle);
						let level = campaign.find(entry => entry.vesicle === index) || null;
						if (level !== null) {

							subtitle.setValue(level.label);

							if (confirm !== null && vesicle.team === team) {

								confirm.unbind('touch');
								confirm.bind('touch', function() {
									this.main.changeState('game', level.data);
								}, this);
								confirm.setVisible(true);

							} else {

								subtitle.setValue('(Battlefield not unlocked)');

								confirm.unbind('touch');
								confirm.setVisible(false);

							}

						} else {

							subtitle.setValue('');

							if (confirm !== null) {

								confirm.unbind('touch');
								confirm.setVisible(false);

							}

						}

					}


					unit.move({
						x: found.position.x + vesicle.position.x,
						y: found.position.y + vesicle.position.y
					});


					if (team !== unit.team) {
						unit.setTeam(team);
					}

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(main) {

		_State.call(this, main);


		this.deserialize(_BLOB);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			let viewport = this.viewport;
			if (viewport !== null) {

				viewport.bind('reshape', function(orientation, rotation) {

					let renderer = this.renderer;
					if (renderer !== null) {

						let entity = null;
						let width  = renderer.width;
						let height = renderer.height;
						let dim    = Math.min(width, height);


						entity            = this.query('game > immune');
						entity.radius     = (dim / 6) | 0;
						entity.position.x = -1 / 2 * width  + entity.radius + dim / 16;
						entity.position.y = -1 / 2 * height + entity.radius + dim / 16;

						entity            = this.query('game > virus');
						entity.radius     = (dim / 6) | 0;
						entity.position.x = 1 / 2 * width  - entity.radius - dim / 16;
						entity.position.y = 1 / 2 * height - entity.radius - dim / 16;

						entity            = this.query('game > neutral');
						entity.radius     = (dim / 8) | 0;
						entity.position.x = -1 / 4 * dim;
						entity.position.y =  1 / 4 * dim;

					}

				}, this);

			}


			let immune = this.query('game > immune');
			let virus  = this.query('game > virus');

			immune.health = 20;
			virus.health  = 20;

		},

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'game.state.Menu';


			return data;

		},



		/*
		 * STATE API
		 */

		enter: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			let layer = this.getLayer('ui');
			if (layer !== null) {
				layer.bind('touch', _move_unit, this);
			}


			return _State.prototype.enter.call(this, oncomplete);

		},

		leave: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			let layer = this.getLayer('ui');
			if (layer !== null) {
				layer.unbind('touch', _move_unit, this);
			}


			return _State.prototype.leave.call(this, oncomplete);

		}

	};


	return Composite;

});

