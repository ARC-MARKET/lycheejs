
lychee.define('ranger.state.Servers').requires([
	'lychee.ui.entity.Helper',
	'lychee.ui.entity.Label',
	'lychee.ui.layer.Table',
	'ranger.ui.entity.Identifier',
	'ranger.ui.layer.Control',
	'ranger.ui.layer.Web'
]).includes([
	'lychee.ui.State'
]).exports((lychee, global, attachments) => {

	const _Helper = lychee.import('lychee.ui.entity.Helper');
	const _State  = lychee.import('lychee.ui.State');
	const _BLOB   = attachments['json'].buffer;
	const _helper = new _Helper();



	/*
	 * HELPERS
	 */

	const _on_sync = function(projects) {

		let dialog = this.query('ui > servers > dialog');
		let status = this.query('ui > servers > status');

		if (dialog !== null && status !== null) {
			dialog.setVisible(false);
			status.setVisible(true);
		}


		if (projects instanceof Array) {

			let value = projects.map(project => {

				let control = {
					label: [],
					value: []
				};

				let web     = {
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

					project.web.forEach(value => {
						web.label.push('Web');
						web.value.push('web=' + value);
					});

				}


				return {
					identifier: project.identifier,
					control:    control,
					web:        web
				};

			});


			if (value.length > 0) {

				let table = this.query('ui > servers > status > 1');
				if (table !== null) {
					table.setValue(value);
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
		 * STATE API
		 */

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			let menu = this.query('ui > menu');
			if (menu !== null) {
				menu.setHelpers([
					'refresh',
					'unboot'
				]);
			}


			let dialog = this.query('ui > servers > dialog');
			if (dialog !== null) {

				dialog.bind('#change', function(self, value) {

					if (value === 'boot') {

						let profile = self.query('profile');
						if (profile !== null) {

							_helper.setValue('boot=' + profile.value);
							_helper.trigger('touch');

							self.setVisible(false);

							this.loop.setTimeout(3000, function() {
								this.changeState('servers');
							}, this.main);

						}

					}

				}, this);

			}


			let viewport = this.viewport;
			let servers  = this.query('ui > servers');

			if (viewport !== null && servers !== null) {

				servers.bind('#relayout', self => {

					let element = self.query('status');
					if (element !== null) {

						element.width  = self.width - 64;
						element.height = self.height;
						element.trigger('relayout');

						let entity = element.getEntity('1');
						if (entity !== null && element !== null) {
							entity.width  = element.width  - 32;
							entity.height = element.height - 96;
						}

					}

				}, this);

			}

		},

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'ranger.state.Servers';


			return data;

		},

		enter: function(oncomplete, data) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;
			data       = typeof data === 'string'       ? data       : null;


			let dialog = this.query('ui > servers > dialog');
			let status = this.query('ui > servers > status');

			if (dialog !== null && status !== null) {
				dialog.setVisible(true);
				status.setVisible(false);
			}


			let client = this.client;
			if (client !== null) {

				let service = client.getService('project');
				if (service !== null) {
					service.bind('sync', _on_sync, this);
					service.sync();
				}

			}


			return _State.prototype.enter.call(this, oncomplete, data);

		},

		leave: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			let client = this.client;
			if (client !== null) {

				let service = client.getService('project');
				if (service !== null) {
					service.unbind('sync', _on_sync, this);
				}

			}


			return _State.prototype.leave.call(this, oncomplete);

		}

	};


	return Composite;

});
