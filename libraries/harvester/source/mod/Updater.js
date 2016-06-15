
lychee.define('harvester.mod.Updater').requires([
	'harvester.net.Client'
]).exports(function(lychee, global, attachments) {

	var _Client = lychee.import('harvester.net.Client');
	var _client = null;



	/*
	 * HELPERS
	 */

	var _on_sync = function(project, data) {

		console.log('SYNCHRONIZING UPDATES', project, data);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'harvester.mod.Updater',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		can: function(project) {

			if (_client === null) {

				_client = new _Client({
					host: 'harvester.artificial.engineering',
					port: 8080
				});

			}


			if (project.identifier.indexOf('__') === -1 && project.package !== null && project.filesystem !== null) {

				var service = _client.getService('update');
				if (service !== null) {
					return true;
				}

			}


			return false;

		},

		process: function(project) {

			if (project.package !== null) {

				var service = _client.getService('update');
				if (service !== null) {

					service.sync({
						identifier: project.identifier
					});

					service.bind('sync', function(data) {
						_on_sync.call(this, project, data);
					}, this, true);

				}

			}

		}

	};


	return Module;

});

