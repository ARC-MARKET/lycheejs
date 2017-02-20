
lychee.define('harvester.mod.Harvester').requires([
	'harvester.net.Client'
]).exports(function(lychee, global, attachments) {

	const _Client = lychee.import('harvester.net.Client');
	let   _CLIENT = null;



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'harvester.mod.Harvester',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		can: function(project) {

			if (_CLIENT === null) {

				_CLIENT = new _Client({
					host: 'harvester.artificial.engineering',
					port: 4848
				});

				_CLIENT.bind('disconnect', function() {

					console.log('\n');
					console.warn('+--------------------------------------------------------+');
					console.warn('| No connection to harvester.artificial.engineering:4848 |');
					console.warn('| Cannot synchronize data for AI training and knowledge  |');
					console.warn('+--------------------------------------------------------+');
					console.log('\n');

				});

			}


			if (project.identifier.indexOf('__') === -1 && project.package !== null) {

				let service = _CLIENT.getService('harvester');
				if (service !== null) {
					return true;
				}

			}


			return false;

		},

		process: function(project) {

			if (project.package !== null) {

				let service = _CLIENT.getService('harvester');
				if (service !== null) {
					service.connect();
				}

			}

		}

	};


	return Module;

});

