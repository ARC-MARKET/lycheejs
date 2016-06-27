
lychee.define('app.state.Welcome').requires([
	'lychee.ui.entity.Helper',
	'lychee.ui.entity.Label',
	'lychee.ui.layer.Table',
	'app.ui.entity.Identifier',
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

				entity = this.queryLayer('ui', 'welcome');
				entity.bind('#relayout', function(blueprint) {

					var element = this.queryLayer('ui', 'welcome > status');
					if (element !== null) {
						element.width  = blueprint.width - 64;
						element.height = blueprint.height;
						element.trigger('relayout');
					}

					var entity = element.getEntity('0');
					if (entity !== null && element !== null) {
						entity.width  = element.width  - 32;
						entity.height = element.height - 96;
					}

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
