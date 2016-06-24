
lychee.define('harvester.mod.Fertilizer').tags({
	platform: 'node'
}).requires([
	'harvester.data.Filesystem'
]).supports(function(lychee, global) {

	try {

		require('child_process');

		return true;

	} catch(err) {

	}


	return false;

}).exports(function(lychee, global, attachments) {

	var _child_process = require('child_process');
	var _Filesystem    = lychee.import('harvester.data.Filesystem');
	var _CACHE         = { active: false, queue: [] };
	var _ROOT          = new _Filesystem().root;



	/*
	 * FEATURE DETECTION
	 */

	(function(cache) {

		setInterval(function() {

			if (cache.active === false) {

				var tmp = cache.queue.splice(0, 1);
				if (tmp.length === 1) {

					cache.active = true;
					_fertilize(tmp[0].project, tmp[0].target);

				}

			}

		}, 1000);

	})(_CACHE);



	/*
	 * HELPERS
	 */

	var _is_queue = function(project, target) {

		var found = false;

		_CACHE.queue.forEach(function(entry) {

			if (entry.project === project && entry.target === target) {
				found = true;
			}

		});

		return found;

	};

	var _fertilize = function(project, target) {

		_child_process.execFile(_ROOT + '/bin/fertilizer.sh', [
			target,
			project
		], {
			cwd: _ROOT
		}, function(error, stdout, stderr) {

			_CACHE.active = false;

			if (error || stdout.indexOf('SUCCESS') === -1) {
				console.error('harvester.mod.Fertilizer: FAILURE ("' + project + ' | ' + target + '")');
			} else {
				console.info('harvester.mod.Fertilizer: SUCCESS ("' + project + ' | ' + target + '")');
			}

		});

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
				'reference': 'harvester.mod.Fertilizer',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		can: function(project) {

			if (project.package !== null) {

				var build = project.package.json.build || null;
				if (build !== null) {

					var environments = build.environments || null;
					if (environments !== null) {

						var targets = Object.keys(environments);
						if (targets.length > 0) {

							var root = project.filesystem.root.substr(_ROOT.length);

							targets = targets.filter(function(target) {
								return _is_queue(root, target) === false;
							});

							if (targets.length > 0) {
								return true;
							}

						}

					}

				}

			}


			return false;

		},

		process: function(project) {

			if (project.filesystem !== null && project.package !== null) {

				var build = project.package.json.build || null;
				if (build !== null) {

					var environments = build.environments || null;
					if (environments !== null) {

						var targets = Object.keys(environments);
						if (targets.length > 0) {

							targets = targets.filter(function(target) {
								return _is_queue(project.identifier, target) === false;
							});

							if (targets.length > 0) {

								targets.forEach(function(target) {

									_CACHE.queue.push({
										project: project.identifier,
										target:  target
									});

								});

							}

						}

					}

				}

			}

		}

	};


	return Module;

});

