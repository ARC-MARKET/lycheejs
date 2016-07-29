
lychee.define('lychee.ui.State').requires([
	'lychee.effect.Position',
	'lychee.effect.Visible',
	'lychee.ui.Blueprint',
	'lychee.ui.Element',
	'lychee.ui.Layer',
	'lychee.ui.Menu',
	'lychee.ui.element.Input',
	'lychee.ui.element.Jukebox',
	'lychee.ui.element.Network',
	'lychee.ui.element.Stash',
	'lychee.ui.element.Storage',
	'lychee.ui.element.Viewport',
	'lychee.ui.sprite.Background',
	'lychee.ui.sprite.Emblem'
]).includes([
	'lychee.app.State'
]).exports(function(lychee, global, attachments) {

	const _BLOB      = attachments["json"].buffer;
	const _INSTANCES = [];
	let   _MENU      = null;



	/*
	 * HELPERS
	 */

	const _on_escape = function() {

		let menu = this.queryLayer('ui', 'menu');
		if (menu !== null) {

			if (menu.state === 'active') {

				if (this.__focus !== null) {
					this.__focus.trigger('blur');
				}

				this.__focus = this.queryLayer('ui', menu.value.toLowerCase());
				this.__focus.trigger('focus');

			} else {

				if (this.__focus !== null) {
					this.__focus.trigger('blur');
				}

				this.__focus = menu;
				this.__focus.trigger('focus');

			}

		}

	};

	const _on_fade = function(id) {

		let fade_offset = -3/2 * this.getLayer('ui').height;
		let entity      = this.queryLayer('ui', id);
		let layers      = this.getLayer('ui').entities.filter(function(layer) {
			return lychee.interfaceof(lychee.ui.Menu, layer) === false;
		});


		if (entity !== null && entity.visible === false) {

			layers.forEach(function(layer) {

				if (entity === layer) {

					layer.setVisible(true);
					layer.setPosition({
						y: fade_offset
					});

					layer.addEffect(new lychee.effect.Position({
						type:     lychee.effect.Position.TYPE.easeout,
						duration: 300,
						position: {
							y: 0
						}
					}));

				} else {

					layer.setPosition({
						y: 0
					});

					layer.addEffect(new lychee.effect.Position({
						type:     lychee.effect.Position.TYPE.easeout,
						duration: 300,
						position: {
							y: fade_offset
						}
					}));

					layer.addEffect(new lychee.effect.Visible({
						delay:   300,
						visible: false
					}));

				}

			});

		} else if (entity === null) {

			layers.forEach(function(layer) {

				layer.setPosition({
					y: 0
				});

				layer.addEffect(new lychee.effect.Position({
					type:     lychee.effect.Position.TYPE.easeout,
					duration: 300,
					position: {
						y: fade_offset
					}
				}));

				layer.addEffect(new lychee.effect.Visible({
					delay:   300,
					visible: false
				}));

			});

		}

	};

	const _on_relayout = function() {

		let viewport = this.viewport;
		if (viewport !== null) {

			let entity = null;
			let width  = viewport.width;
			let height = viewport.height;
			let menu   = this.queryLayer('ui', 'menu');
			if (menu !== null) {

				entity = this.getLayer('ui');
				entity.width  = width;
				entity.height = height;


				for (let e = 0, el = entity.entities.length; e < el; e++) {

					let blueprint = entity.entities[e];
					if (blueprint !== menu) {

						blueprint.width      = width - menu.width;
						blueprint.height     = height;
						blueprint.position.x = menu.width / 2;
						blueprint.trigger('relayout');

					}

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(main) {

		lychee.app.State.call(this, main);


		this.__layers.ui = new lychee.ui.Layer();


		_INSTANCES.push(this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = lychee.app.State.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.State';


			return data;

		},

		deserialize: function(blob) {

			if (_INSTANCES[0] === this) {

				lychee.app.State.prototype.deserialize.call(this, _BLOB);
				lychee.app.State.prototype.deserialize.call(this, blob);


				let menu = this.queryLayer('ui', 'menu');
				let main = this.main;
				if (main !== null && menu !== null) {

					_MENU = menu;

					_MENU.bind('change', function(value) {

						let val = value.toLowerCase();

						for (let sid in this.__states) {

							let state = this.__states[sid];
							let layer = state.queryLayer('ui', val);

							if (layer !== null) {

								this.changeState(sid, val);

							} else if (sid === val) {

								this.changeState(sid);

							}

						}

					}, this.main);


					let viewport = this.viewport;
					if (viewport !== null) {

						viewport.relay('reshape', this.queryLayer('bg', 'background'));
						viewport.relay('reshape', this.queryLayer('bg', 'emblem'));
						viewport.relay('reshape', this.queryLayer('ui', 'menu'));

						viewport.relay('reshape', this.queryLayer('ui', 'welcome'));
						viewport.relay('reshape', this.queryLayer('ui', 'settings'));

					}

				}

			} else {

				lychee.app.State.prototype.deserialize.call(this, blob);


				let menu = this.queryLayer('ui', 'menu');
				if (menu !== null && menu !== _MENU) {

					this.getLayer('ui').removeEntity(menu);
					this.getLayer('ui').setEntity('menu', _MENU);

				} else if (menu === null) {

					this.getLayer('ui').setEntity('menu', _MENU);
					menu = _MENU;

				}


				let main = this.main;
				if (main !== null && menu !== null) {

					let options = [];
					let ui      = null;
					let bid     = null;
					let entity  = null;


					for (let sid in main.__states) {

						let state = main.__states[sid];

						if (_INSTANCES.indexOf(state) !== -1) {

							ui = state.getLayer('ui');

							if (ui !== null) {

								for (bid in ui.__map) {

									entity = ui.__map[bid];

									if (entity instanceof lychee.ui.Blueprint) {
										options.push(bid.charAt(0).toUpperCase() + bid.substr(1));
									}

								}

							}

						} else {

							options.push(sid.charAt(0).toUpperCase() + sid.substr(1));

						}

					}


					ui = this.getLayer('ui');

					if (ui !== null) {

						for (bid in ui.__map) {

							entity = ui.__map[bid];

							if (entity instanceof lychee.ui.Blueprint) {
								options.push(bid.charAt(0).toUpperCase() + bid.substr(1));
							}

						}

					}


					let index = options.indexOf('Settings');
					if (index !== -1) {
						options.splice(index, 1);
						options.push('Settings');
					}


					menu.setOptions(options);

				}

			}



			if (_MENU !== null) {

				_MENU.bind('relayout', function() {
					_on_relayout.call(this);
				}, this);

			}


			let viewport = this.viewport;
			if (viewport !== null) {

				viewport.bind('reshape', function(orientation, rotation, width, height) {
					_on_relayout.call(this);
				}, this);

			}

		},



		/*
		 * STATE API
		 */

		enter: function(oncomplete, data) {

			data = typeof data === 'string' ? data : 'welcome';


			_on_fade.call(this, data);


			let focus = this.queryLayer('ui', data);
			if (focus !== null && focus !== _MENU) {
				focus.trigger('focus');
				this.__focus = focus;
			}


			let input = this.input;
			if (input !== null) {
				input.bind('escape', _on_escape, this);
			}


			this.loop.setTimeout(400, function() {
				lychee.app.State.prototype.enter.call(this, oncomplete);
			}, this);

		},

		leave: function(oncomplete) {

			_on_fade.call(this, null);


			let input = this.input;
			if (input !== null) {
				input.unbind('escape', _on_escape, this);
			}


			let focus = this.__focus;
			if (focus !== null && focus !== _MENU) {
				focus.trigger('blur');
				this.__focus = null;
			}


			this.loop.setTimeout(400, function() {
				lychee.app.State.prototype.leave.call(this, oncomplete);
			}, this);

		}

	};


	return Composite;

});
