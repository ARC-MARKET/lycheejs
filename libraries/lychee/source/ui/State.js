
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

	var _BLOB      = attachments["json"].buffer;
	var _MENU      = null;
	var _instances = [];



	/*
	 * HELPERS
	 */

	var _on_escape = function() {

		var menu = this.queryLayer('ui', 'menu');
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

	var _on_fade = function(id) {

		var fade_offset = -3/2 * this.getLayer('ui').height;
		var entity      = this.queryLayer('ui', id);
		var layers      = this.getLayer('ui').entities.filter(function(layer) {
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

	var _on_relayout = function() {

		var viewport = this.viewport;
		if (viewport !== null) {

			var entity = null;
			var width  = viewport.width;
			var height = viewport.height;
			var menu   = this.queryLayer('ui', 'menu');
			if (menu !== null) {

				entity = this.getLayer('ui');
				entity.width  = width;
				entity.height = height;


				for (var e = 0, el = entity.entities.length; e < el; e++) {

					var blueprint = entity.entities[e];
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

	var Class = function(main) {

		lychee.app.State.call(this, main);


		_instances.push(this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.app.State.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.State';


			return data;

		},

		deserialize: function(blob) {

			if (_instances[0] === this) {

				lychee.app.State.prototype.deserialize.call(this, _BLOB);
				lychee.app.State.prototype.deserialize.call(this, blob);


				var menu = this.queryLayer('ui', 'menu');
				var main = this.main;
				if (main !== null && menu !== null) {

					_MENU = menu;

					_MENU.bind('change', function(value) {

						var val = value.toLowerCase();

						for (var sid in this.__states) {

							var state = this.__states[sid];
							var layer = state.queryLayer('ui', val);

							if (layer !== null) {

								this.changeState(sid, val);

							} else if (sid === val) {

								this.changeState(sid);

							}

						}

					}, this.main);


					var viewport = this.viewport;
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


				var menu = this.queryLayer('ui', 'menu');
				if (menu !== null && menu !== _MENU) {

					this.getLayer('ui').removeEntity(menu);
					this.getLayer('ui').setEntity('menu', _MENU);

				} else if (menu === null) {

					this.getLayer('ui').setEntity('menu', _MENU);
					menu = _MENU;

				}


				var main = this.main;
				if (main !== null && menu !== null) {

					var options = [];
					var ui, bid, entity;


					for (var sid in main.__states) {

						var state = main.__states[sid];

						if (_instances.indexOf(state) !== -1) {

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


					var index = options.indexOf('Settings');
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


			var viewport = this.viewport;
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


			var focus = this.queryLayer('ui', data);
			if (focus !== null && focus !== _MENU) {
				focus.trigger('focus');
				this.__focus = focus;
			}


			var input = this.input;
			if (input !== null) {
				input.bind('escape', _on_escape, this);
			}


			this.loop.setTimeout(400, function() {
				lychee.app.State.prototype.enter.call(this, oncomplete);
			}, this);

		},

		leave: function(oncomplete) {

			_on_fade.call(this, null);


			var input = this.input;
			if (input !== null) {
				input.unbind('escape', _on_escape, this);
			}


			var focus = this.__focus;
			if (focus !== null && focus !== _MENU) {
				focus.trigger('blur');
				this.__focus = null;
			}


			this.loop.setTimeout(400, function() {
				lychee.app.State.prototype.leave.call(this, oncomplete);
			}, this);

		}

	};


	return Class;

});
