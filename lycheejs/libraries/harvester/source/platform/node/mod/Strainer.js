
lychee.define('harvester.mod.Strainer').tags({
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
	const _QUEUE         = [];
	const _ROOT          = lychee.ROOT.lychee;



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		_setInterval(_ => {

			if (_ACTIVE === false) {

				let tmp = _QUEUE.splice(0, 1);
				if (tmp.length === 1) {

					_ACTIVE = true;
					_strain(tmp[0].project);

				}

			}

		}, 1000);

	})();



	/*
	 * HELPERS
	 */

	const _is_queued = function(id) {

		let entry = _QUEUE.find(e => e.project === id) || null;
		if (entry !== null) {
			return true;
		}

		return false;

	};

	const _strain = function(project) {

		let handle = null;

		try {

			// XXX: Alternative (_ROOT + '/bin/helper/helper.sh', [ 'env:node', _ROOT + '/libraries/strainer/bin/strainer.js', target, project ])

			handle = _child_process.execFile(_BINARY, [
				_ROOT + '/libraries/strainer/bin/strainer.js',
				'check',
				project
			], {
				cwd: _ROOT
			}, (error, stdout, stderr) => {

				_ACTIVE = false;


				let tmp_err = stderr.trim().split('\n').map(line => {
					return line.substr(15, line.length - 29).trim();
				}).filter(line => {
					return line.startsWith('strainer: /');
				});

				let tmp_out = stdout.trim().split('\n').filter(line => {
					return line.includes('(W)');
				}).map(line => {
					return line.substr(15, line.length - 29).trim();
				}).filter(line => {
					return line.startsWith('strainer: /');
				});


				if (tmp_err.length > 0) {

					console.error('harvester.mod.Strainer: FAILURE ("' + project + '")');

					tmp_out.forEach(line => console.warn(line));
					tmp_err.forEach(line => console.error(line));

				} else if (tmp_out.length > 0) {

					console.info('harvester.mod.Strainer: SUCCESS ("' + project + '")');

					tmp_out.forEach(line => console.warn(line));

				} else if (error) {

					console.error('harvester.mod.Strainer: ERROR ("' + project + '")');

				} else {

					console.info('harvester.mod.Strainer: SUCCESS ("' + project + '")');

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
				'reference': 'harvester.mod.Strainer',
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
				let fs  = project.filesystem;
				let pkg = project.package;

				if (id.indexOf('__') === -1 && pkg !== null && fs !== null) {

					let buffer = fs.read('/api/strainer.pkg');
					let data   = [];

					try {
						data = JSON.parse(buffer.toString('utf8'));
					} catch (err) {
						data = [];
					}


					let needs_check = false;

					if (data.length > 0) {

						for (let d = 0, dl = data.length; d < dl; d++) {

							if (data[d] < Date.now()) {
								needs_check = true;
								break;
							}

						}

					} else {

						needs_check = true;

					}

					return needs_check;

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

					if (_is_queued(id) === false) {

						_QUEUE.push({
							project: id
						});


						return true;

					}

				}

			}


			return false;

		}

	};


	return Module;

});

