
lychee.define('app.state.Welcome').includes([
	'lychee.ui.State'
]).requires([
	'lychee.ui.Blueprint',
	'lychee.ui.Element',
	'lychee.ui.Layer',
	'lychee.ui.element.Search'
]).exports(function(lychee, global, attachments) {

	var _State = lychee.import('lychee.ui.State');
	var _BLOB  = attachments["json"].buffer;



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		_State.call(this, main);


		this.api = main.api || null;


		this.deserialize(_BLOB);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _State.prototype.serialize.call(this);
			data['constructor'] = 'app.state.Welcome';


			return data;

		},

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			this.queryLayer('ui', 'menu').setHelpers([
				'refresh'
			]);


			var api = this.api;
			if (api !== null) {

				var select          = this.queryLayer('ui', 'welcome > select');
				var library_service = api.getService('library');
				var project_service = api.getService('project');

				if (library_service !== null) {

					library_service.bind('sync', function(data) {

						if (data instanceof Array) {

							var filtered = [].slice.call(this.data);

							data.map(function(library) {
								return library.identifier;
							}).forEach(function(value) {

								if (filtered.indexOf(value) === -1) {
									filtered.push(value);
								}

							});

							this.setData(filtered);

						}

					}, select);

				}


				if (project_service !== null) {

					project_service.bind('sync', function(data) {

						if (data instanceof Array) {

							var filtered = [].slice.call(this.data);

							data.map(function(project) {
								return project.identifier;
							}).forEach(function(value) {

								if (filtered.indexOf(value) === -1) {
									filtered.push(value);
								}

							});

							this.setData(filtered);

						}

					}, select);

				}

			}


			this.queryLayer('ui', 'welcome > select').setData([
				'foo',
				'foo1',
				'foo2',
				'foo3',
				'foo4',
				'foo5'
			]);


			this.queryLayer('ui', 'welcome > select').bind('change', function(value) {

console.log('SELECTED', value);

			}, this);

		},

		enter: function(oncomplete, data) {

			var api = this.api;
			if (api !== null) {

				var library_service = api.getService('library');
				if (library_service !== null) {
					library_service.sync();
				}

				var project_service = api.getService('project');
				if (project_service !== null) {
					project_service.sync();
				}

			}


			_State.prototype.enter.call(this, oncomplete, data);

		}

	};


	return Class;

});
