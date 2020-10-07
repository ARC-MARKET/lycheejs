
lychee.define('studio.state.Project').requires([
	'studio.data.Project',
	'studio.ui.element.modify.Project',
	'lychee.ui.Blueprint',
	'lychee.ui.Element',
	'lychee.ui.Layer',
	'lychee.ui.element.Search'
]).includes([
	'lychee.ui.State'
]).exports((lychee, global, attachments) => {

	const _Project = lychee.import('studio.data.Project');
	const _State   = lychee.import('lychee.ui.State');
	const _BLOB    = attachments['json'].buffer;
	const _CACHE   = {};



	/*
	 * HELPERS
	 */

	const _on_sync = function(data) {

		let select = this.query('ui > project > select');
		if (select !== null) {

			let filtered = Array.from(select.data);

			data.map(project => project.identifier).forEach(identifier => {

				if (filtered.includes(identifier) === false) {
					filtered.push(identifier);
				}

			});

			filtered = filtered.filter(v => v !== '/libraries/harvester');

			select.setData(filtered);

		}

	};

	const _on_select_change = function(value) {

		if (/^\/libraries|projects\//g.test(value) === false) {
			value = '/projects/' + value.split('/').pop();
		}


		let cache  = _CACHE[value] || null;
		let modify = this.query('ui > project > modify');
		let notice = this.query('ui > notice');

		if (cache === null) {

			cache = _CACHE[value] = new _Project({
				identifier: value
			});

			cache.onload = function() {

				this.main.setProject(cache);


				if (modify !== null) {
					modify.setValue(cache);
					modify.setVisible(true);
				}

				if (notice !== null) {
					notice.setLabel('Project opened.');
					notice.setState('active');
				}

			}.bind(this);

			cache.load();

		} else {

			if (modify !== null) {
				modify.setValue(cache);
				modify.setVisible(true);
			}

			if (notice !== null) {
				notice.setLabel('Project opened.');
				notice.setState('active');
			}

		}

	};

	const _on_modify_change = function(action) {

		let select = this.query('ui > project > select');
		let modify = this.query('ui > project > modify');
		let notice = this.query('ui > notice');


		if (select !== null && modify !== null) {

			if (action === 'save') {

				let stash = this.main.stash || null;
				let asset = modify.value;

				if (asset !== null && stash !== null) {

					let assets = [];
					let urls   = [];

					if (asset.icon !== null) {
						assets.push(asset.icon);
						urls.push(asset.icon.url);
					}

					if (asset.config !== null) {
						assets.push(asset.config);
						urls.push(asset.config.url);
					}

					if (urls.length > 0) {

						stash.write(urls, assets, result => {

							if (notice !== null) {
								notice.setLabel('Project saved.');
								notice.setState('active');
							}

						}, this);

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


		this.api = main.api || null;


		this.deserialize(_BLOB);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'studio.state.Project';


			return data;

		},

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			let menu = this.query('ui > menu');
			if (menu !== null) {

				menu.setHelpers([
					'refresh'
				]);

			}

			let notice = this.query('ui > notice');
			if (notice !== null) {
				notice.setOptions([]);
			}


			let select = this.query('ui > project > select');
			if (select !== null) {
				select.bind('change', _on_select_change, this);
			}


			let modify = this.query('ui > project > modify');
			if (modify !== null) {
				modify.bind('change', _on_modify_change, this);
			}


			let api = this.api;
			if (api !== null) {

				let library_service = api.getService('library');
				if (library_service !== null) {
					library_service.bind('sync', _on_sync, this);
				}

				let project_service = api.getService('project');
				if (project_service !== null) {
					project_service.bind('sync', _on_sync, this);
				}

			}

		},

		enter: function(oncomplete, data) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;
			data       = typeof data === 'string'       ? data       : null;


			let api = this.api;
			if (api !== null) {

				let library_service = api.getService('library');
				if (library_service !== null) {
					library_service.sync();
				}

				let project_service = api.getService('project');
				if (project_service !== null) {
					project_service.sync();
				}

			}


			return _State.prototype.enter.call(this, oncomplete, data);

		}

	};


	return Composite;

});
