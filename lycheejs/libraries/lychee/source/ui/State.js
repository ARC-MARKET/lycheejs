
lychee.define('lychee.ui.State').requires([
	'lychee.effect.Position',
	'lychee.effect.Visible',
	'lychee.ui.Blueprint',
	'lychee.ui.Element',
	'lychee.ui.Layer',
	'lychee.ui.Menu',
	'lychee.ui.Notice',
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
]).exports((lychee, global, attachments) => {

	const _Blueprint = lychee.import('lychee.ui.Blueprint');
	const _Layer     = lychee.import('lychee.ui.Layer');
	const _Position  = lychee.import('lychee.effect.Position');
	const _State     = lychee.import('lychee.app.State');
	const _Visible   = lychee.import('lychee.effect.Visible');
	const _BLOB      = attachments['json'].buffer;
	let   _BG        = null;
	const _INSTANCES = [];
	let   _MENU      = null;
	let   _NOTICE    = null;



	/*
	 * HELPERS
	 */

	const _on_escape = function() {

		let menu = this.query('ui > menu');
		if (menu !== null) {

			if (menu.state === 'active') {

				if (this.__focus !== null) {
					this.__focus.trigger('blur');
				}

				this.__focus = this.query('ui > ' + menu.value.toLowerCase());
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

		let fade_offset = -3 / 2 * this.getLayer('ui').height;
		let entity      = this.query('ui > ' + id);
		let layers      = this.getLayer('ui').entities.filter(layer => layer !== _MENU && layer !== _NOTICE);

		if (entity !== null && entity.visible === false) {

			layers.forEach(layer => {

				if (entity === layer) {

					layer.setVisible(true);
					layer.setPosition({
						y: fade_offset
					});

					layer.addEffect(new _Position({
						type:     _Position.TYPE.easeout,
						duration: 300,
						position: {
							y: 0
						}
					}));

				} else {

					layer.setPosition({
						y: 0
					});

					layer.addEffect(new _Position({
						type:     _Position.TYPE.easeout,
						duration: 300,
						position: {
							y: fade_offset
						}
					}));

					layer.addEffect(new _Visible({
						delay:   300,
						visible: false
					}));

				}

			});

		} else if (entity === null) {

			layers.forEach(layer => {

				layer.setPosition({
					y: 0
				});

				layer.addEffect(new _Position({
					type:     _Position.TYPE.easeout,
					duration: 300,
					position: {
						y: fade_offset
					}
				}));

				layer.addEffect(new _Visible({
					delay:   300,
					visible: false
				}));

			});

		}

	};

	const _on_relayout = function() {

		let renderer = this.renderer;
		if (renderer !== null) {

			let entity = null;
			let width  = renderer.width;
			let height = renderer.height;


			let menu   = this.query('ui > menu');
			let notice = this.query('ui > notice');

			if (menu !== null && notice !== null) {

				entity = this.getLayer('ui');
				entity.width  = width;
				entity.height = height;


				for (let e = 0, el = entity.entities.length; e < el; e++) {

					let blueprint = entity.entities[e];
					if (blueprint !== menu && blueprint !== notice) {

						blueprint.width      = width - menu.width;
						blueprint.height     = height;
						blueprint.position.x = menu.width / 2;
						blueprint.trigger('relayout');

					}

				}


				notice.position.x = menu.width / 2;
				notice.trigger('relayout');

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(main) {

		this.__layers = {
			ui: new _Layer()
		};

		this.__layers_map = [];


		_State.call(this, main);


		// XXX: Make sure layers map contains "ui"
		let ids = Object.keys(this.__layers).sort();
		if (ids.length > 0) {
			this.__layers_map = ids;
		}


		_INSTANCES.push(this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.State';


			return data;

		},

		deserialize: function(blob) {

			if (_INSTANCES[0] === this) {

				_State.prototype.deserialize.call(this, _BLOB);
				_State.prototype.deserialize.call(this, blob);


				let main   = this.main;
				let bg     = this.getLayer('bg');
				let menu   = this.query('ui > menu');
				let notice = this.query('ui > notice');


				if (main !== null && bg !== null) {
					_BG = bg;
				}


				if (main !== null && menu !== null) {

					_MENU = menu;

					_MENU.bind('change', function(value) {

						let val = value.toLowerCase();

						for (let sid in this.__states) {

							let state = this.__states[sid];
							let layer = state.query('ui > ' + val);

							if (layer !== null) {

								this.changeState(sid, val);

							} else if (sid === val) {

								this.changeState(sid);

							}

						}

					}, this.main);


					let viewport = this.viewport;
					if (viewport !== null) {

						viewport.bind('reshape', function(orientation, rotation, width, height) {

							let renderer = this.renderer;
							if (renderer !== null) {

								let args = [
									orientation,
									rotation,
									renderer.width,
									renderer.height
								];

								let entities = [
									this.query('bg > background'),
									this.query('bg > emblem'),
									this.query('ui > menu'),
									this.query('ui > notice'),
									this.query('ui > settings')
								].filter(entity => entity !== null);

								for (let e = 0, el = entities.length; e < el; e++) {
									entities[e].trigger('reshape', args);
								}

							}

						}, this);

					}

				}


				if (main !== null && notice !== null) {
					_NOTICE = notice;
				}


			} else {

				_State.prototype.deserialize.call(this, blob);


				let main   = this.main;
				let bg     = this.getLayer('bg');
				let menu   = this.query('ui > menu');
				let notice = this.query('ui > notice');


				if (bg !== null && bg !== _BG) {

					// Allow custom bg for each state

				} else if (bg === null) {

					this.setLayer('bg', _BG);
					bg = _BG;

				}


				if (menu !== null && menu !== _MENU) {

					this.getLayer('ui').removeEntity(menu);
					this.getLayer('ui').setEntity('menu', _MENU);
					menu = _MENU;

				} else if (menu === null) {

					this.getLayer('ui').setEntity('menu', _MENU);
					menu = _MENU;

				}


				if (notice !== null && notice !== _NOTICE) {

					this.getLayer('ui').removeEntity(notice);
					this.getLayer('ui').setEntity('notice', _NOTICE);
					notice = _NOTICE;

				} else if (notice === null) {

					this.getLayer('ui').setEntity('notice', _NOTICE);
					notice = _NOTICE;

				}


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

									if (entity instanceof _Blueprint) {
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

							if (entity instanceof _Blueprint) {
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

			oncomplete = oncomplete instanceof Function ? oncomplete : null;
			data       = typeof data === 'string'       ? data       : 'settings';


			let id_layer = data.toLowerCase();
			if (id_layer.length > 0) {

				_on_fade.call(this, id_layer);


				let focus = this.query('ui > ' + id_layer);
				if (focus !== null && focus !== _MENU) {
					focus.trigger('focus');
					this.__focus = focus;
				}


				if (_MENU !== null) {

					let id_menu = data.charAt(0).toUpperCase() + data.substr(1);
					if (id_menu !== _MENU.value) {
						_MENU.setValue(id_menu);
					}

				}

			}


			let input = this.input;
			if (input !== null) {
				input.bind('escape', _on_escape, this);
			}


			this.loop.setTimeout(400, function() {
				_State.prototype.enter.call(this, oncomplete);
			}, this);


			return true;

		},

		leave: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


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
				_State.prototype.leave.call(this, oncomplete);
			}, this);


			return true;

		},

		render: function(clock, delta, custom) {

			let renderer = this.renderer;
			if (renderer !== null) {

				let menu   = _MENU;
				let notice = _NOTICE;
				let layer  = this.__layers.ui;

				if (menu !== null) {
					menu.visible = false;
				}

				if (notice !== null) {
					notice.visible = false;
				}


				renderer.clear();

				_State.prototype.render.call(this, clock, delta, true);

				if (menu !== null) {

					menu.visible = true;
					menu.render(
						renderer,
						layer.position.x + layer.offset.x,
						layer.position.y + layer.offset.y
					);

				}

				if (notice !== null) {

					notice.visible = true;
					notice.render(
						renderer,
						layer.position.x + layer.offset.x,
						layer.position.y + layer.offset.y
					);

				}

				renderer.flush();

			}

		}

	};


	return Composite;

});
