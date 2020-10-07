
lychee.define('harvester.mod.Harvester').requires([
	'harvester.data.Git',
	'harvester.data.Project',
	'harvester.net.Client'
]).exports((lychee, global, attachments) => {

	const _Client  = lychee.import('harvester.net.Client');
	const _Git     = lychee.import('harvester.data.Git');
	const _Project = lychee.import('harvester.data.Project');
	const _git     = new _Git();
	let   _TIMEOUT = null;



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

		can: function() {

			let timeout = _TIMEOUT;
			if (timeout === null || Date.now() > timeout) {

				let status = _git.status();
				if (status !== null) {
					return status;
				}

			}


			return null;

		},

		process: function() {

			let timeout = _TIMEOUT || null;
			if (timeout === null || Date.now() > timeout) {

				let report = _git.report();
				if (report.status === _Git.STATUS.update) {

					// XXX: timeout is 60 minutes
					_TIMEOUT = Date.now() + 60 * 60 * 1000;


					let result = _git.fetch('upstream', report.branch);
					if (result === true) {

						console.info('harvester.mod.Harvester: FETCH ("' + report.branch + '")');

						// TODO: Merge new HEAD into local history
						// (using git pull upstream <branch>?)

						// TODO: Broadcast local HEAD and reflog
						// TODO: Find system with real HEAD
						// TODO: Synchronize reflog and pull from real HEAD


						return true;

					}

				}

			}


			return false;

		}

	};


	return Module;

});

