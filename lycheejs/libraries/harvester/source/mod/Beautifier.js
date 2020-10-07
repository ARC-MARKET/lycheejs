
lychee.define('harvester.mod.Beautifier').requires([
	'harvester.data.Package',
	'harvester.data.Project'
]).exports((lychee, global, attachments) => {

	const _Project = lychee.import('harvester.data.Package');



	/*
	 * HELPERS
	 */

	const _beautify_json = function(project, path) {

		let data = null;

		try {
			data = JSON.parse(project.filesystem.read(path));
		} catch (err) {
			data = null;
		}


		if (data !== null) {

			data = JSON.stringify(data, null, '\t');
			project.filesystem.write(path, data);

		}


		return data;

	};

	const _get_files = function(project) {

		let files = [];


		// _walk_directory.call(project.filesystem, '/bin', files);
		// _walk_directory.call(project.filesystem, '/api', files);
		// _walk_directory.call(project.filesystem, '/asset', files);
		// _walk_directory.call(project.filesystem, '/build', files);

		_walk_directory.call(project.filesystem, '/review', files);
		_walk_directory.call(project.filesystem, '/source', files);


		return files;

	};

	const _walk_directory = function(path, cache) {

		let name = path.split('/').pop();

		let info = this.info(path);
		if (info !== null && name.startsWith('.') === false) {

			if (info.type === 'file') {

				if (name.endsWith('.json')) {
					cache.push(path);
				}

			} else if (info.type === 'directory') {
				this.dir(path).forEach(child => _walk_directory.call(this, path + '/' + child, cache));
			}

		}

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
				'reference': 'harvester.mod.Beautifier',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		can: function(project) {

			project = project instanceof _Project ? project : null;


			if (project !== null) {

				if (project.identifier.indexOf('__') === -1 && project.package !== null && project.filesystem !== null) {

					let files = _get_files(project);
					if (files.length > 0) {
						return true;
					}

				}

			}


			return false;

		},

		process: function(project) {

			project = project instanceof _Project ? project : null;


			if (project !== null) {

				if (project.package !== null) {

					let files = _get_files(project);
					if (files.length > 0) {

						files.filter(path => path.endsWith('.json')).forEach(path => {
							_beautify_json(project, path);
						});

					}

					return true;

				}

			}


			return false;

		}

	};


	return Module;

});

