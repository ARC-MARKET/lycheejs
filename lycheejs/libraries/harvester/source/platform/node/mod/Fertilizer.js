
lychee.define('harvester.mod.Fertilizer').tags({
	platform: 'node'
}).requires([
	'harvester.data.Project'
]).supports((lychee, global) => {

	if (typeof global.require === 'function') {

		try {

			global.require('child_process');

			return true;

		} catch (err) {

		}

	}


	return false;

}).exports((lychee, global, attachments) => {

	const _child_process = global.require('child_process');
	const _setInterval   = global.setInterval;
	const _Project       = lychee.import('harvester.data.Project');
	const _BINARY        = process.execPath;
	let   _ACTIVE        = false;
	const _CACHE         = {};
	const _QUEUE         = [];
	const _ROOT          = lychee.ROOT.lychee;



	/*
	 * FEATURE DETECTION
	 */

	(function(cache) {

		_setInterval(_ => {

			if (_ACTIVE === false) {

				let tmp = _QUEUE.splice(0, 1);
				if (tmp.length === 1) {

					_ACTIVE = true;
					_fertilize(tmp[0].project, tmp[0].target);

				}

			}

		}, 1000);

	})(_CACHE);



	/*
	 * HELPERS
	 */

	const _is_cached = function(id, target, pkg) {

		let cache = _CACHE[id] || null;
		if (cache !== null) {

			if (cache[target] === pkg) {
				return true;
			}

		}

		return false;

	};

	const _fertilize = function(project, target) {

		let handle = null;

		try {

			// XXX: Alternative (_ROOT + '/bin/helper/helper.sh', [ 'env:node', _ROOT + '/libraries/fertilizer/bin/fertilizer.js', target, project ])
			handle = _child_process.execFile(_BINARY, [
				_ROOT + '/libraries/fertilizer/bin/fertilizer.js',
				target,
				project
			], {
				cwd: lychee.ROOT.lychee
			}, (error, stdout, stderr) => {

				_ACTIVE = false;

				if (error || stdout.indexOf('fertilizer: SUCCESS') === -1) {
					console.error('harvester.mod.Fertilizer: FAILURE ("' + project + ' | ' + target + '")');
				} else {
					console.info('harvester.mod.Fertilizer: SUCCESS ("' + project + ' | ' + target + '")');
				}

			});

		} catch (err) {

			handle = null;

		}

		return handle;

	};



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
				'reference': 'harvester.mod.Fertilizer',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		can: function(project) {

			project = project instanceof _Project ? project : null;


			if (project !== null) {

				let id  = project.identifier;
				let pkg = project.package;

				if (id.indexOf('__') === -1 && pkg !== null) {

					let build = pkg.json.build || null;
					if (build !== null) {

						let environments = build.environments || null;
						if (environments !== null) {

							let targets = Object.keys(environments).filter(t => _is_cached(id, t, pkg) === false);
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

			project = project instanceof _Project ? project : null;


			if (project !== null) {

				let id  = project.identifier;
				let fs  = project.filesystem;
				let pkg = project.package;

				if (fs !== null && pkg !== null) {

					let build = pkg.json.build || null;
					if (build !== null) {

						let environments = build.environments || null;
						if (environments !== null) {

							Object.keys(environments).filter(t => _is_cached(id, t, pkg) === false).forEach(target => {

								let cache = _CACHE[id] || null;
								if (cache === null) {
									cache = _CACHE[id] = {};
								}

								cache[target] = pkg;

								_QUEUE.push({
									project: id,
									target:  target
								});

							});


							return true;

						}

					}

				}

			}


			return false;

		}

	};


	return Module;

});

