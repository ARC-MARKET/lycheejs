
lychee.define('app.state.Welcome').requires([
	'lychee.ui.entity.Helper',
	'lychee.ui.entity.Label',
	'lychee.ui.layer.Table',
	'app.ui.entity.Identifier',
	'app.ui.entity.Status',
	'app.ui.layer.Control',
	'app.ui.layer.Web'
]).includes([
	'lychee.ui.State'
]).exports(function(lychee, global, attachments) {

	var _Helper = lychee.import('lychee.ui.entity.Helper');
	var _State  = lychee.import('lychee.ui.State');
	var _BLOB   = attachments["json"].buffer;
	var _helper = new _Helper();



	/*
	 * HELPERS
	 */

	var _on_sync = function(projects) {

		this.queryLayer('ui', 'welcome > dialog').setVisible(false);
		this.queryLayer('ui', 'welcome > status').setVisible(true);


		if (projects instanceof Array) {

			var value = projects.map(function(project) {

				var control = {
					label: [],
					value: []
				};

				var web     = {
					label: [],
					value: []
				};


				control.label.push('Edit');
				control.value.push('edit=' + project.identifier);


				if (project.filesystem !== null) {
					control.label.push('File');
					control.value.push('file=' + project.identifier);
				}


				if (project.server !== null) {
					control.label.push('Stop');
					control.value.push('stop=' + project.identifier);
				} else if (project.harvester === true) {
					control.label.push('Start');
					control.value.push('start=' + project.identifier);
				}


				if (project.web.length > 0) {

					project.web.forEach(function(value) {

						web.label.push('Web');
						web.value.push('web=' + value);

					});

				}


				return {
					identifier: project.identifier,
					status:     project.server !== null ? 'Online' : 'Offline',
					control:    control,
					web:		web
				};

			});


			if (value.length > 0) {

				var table = this.queryLayer('ui', 'welcome > status > 0');
				if (table !== null) {
					table.setValue(value);
				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		_State.call(this, main);


		this.deserialize(_BLOB);

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			this.queryLayer('ui', 'menu').setHelpers([
				'refresh',
				'unboot'
			]);


			this.queryLayer('ui', 'welcome > dialog').bind('change', function(value) {

				if (value === 'boot') {

					var profile = this.queryLayer('ui', 'welcome > dialog > profile');
					if (profile !== null) {

						_helper.setValue('boot=' + profile.value);
						_helper.trigger('touch');

						this.queryLayer('ui', 'welcome > dialog').setVisible(false);

						this.loop.setTimeout(3000, function() {
							this.changeState('welcome');
						}, this.main);

					}

				}

			}, this);


			var viewport = this.viewport;
			if (viewport !== null) {

				viewport.relay('reshape', this.queryLayer('ui', 'welcome > status'));


				entity = this.queryLayer('ui', 'welcome > status');
				entity.bind('#reshape', function(entity, orientation, rotation, width, height) {

					var menu = this.queryLayer('ui', 'menu');
					var w    = (((width - menu.width) / 512) | 0) * 512;
					var h    = ((height               / 128) | 0) * 128;


					entity.width  = w;
					entity.height = h;


					var table = entity.getEntity('0');
					if (table !== null) {
						table.width  = h - 32;
						table.height = h - 96;
					}


					entity.trigger('relayout');

				}, this);

			}

		},

		serialize: function() {

			var data = _State.prototype.serialize.call(this);
			data['constructor'] = 'app.state.Welcome';


			return data;

		},

		enter: function(oncomplete, data) {

			this.queryLayer('ui', 'welcome > dialog').setVisible(true);
			this.queryLayer('ui', 'welcome > status').setVisible(false);


			var client = this.client;
			if (client !== null) {

				var service = client.getService('project');
				if (service !== null) {
					service.bind('sync', _on_sync, this);
					service.sync();
				}

			}


			_State.prototype.enter.call(this, oncomplete, data);

		},

		leave: function(oncomplete) {

			var client = this.client;
			if (client !== null) {

				var service = client.getService('project');
				if (service !== null) {
					service.unbind('sync', _on_sync, this);
				}

			}


			_State.prototype.leave.call(this, oncomplete);

		}

	};


	return Class;

});
