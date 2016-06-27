
lychee.define('harvester.mod.Packager').requires([
	'harvester.data.Package'
]).exports(function(lychee, global, attachments) {

	var _Package = lychee.import('harvester.data.Package');



	/*
	 * HELPERS
	 */

	var _serialize = function(project) {

		var json = JSON.parse(JSON.stringify(project.package.json));
		var tmp  = {};


		json.api.files    = {};
		json.build.files  = {};
		json.source.files = {};

		_walk_directory.call(project.filesystem, tmp, '/api');
		_walk_directory.call(project.filesystem, tmp, '/build');
		_walk_directory.call(project.filesystem, tmp, '/source');

		json.api.files    = tmp.api    || {};
		json.build.files  = tmp.build  || {};
		json.source.files = tmp.source || {};

		json.api.files    = _sort_recursive(json.api.files);
		json.build.files  = _sort_recursive(json.build.files);
		json.source.files = _sort_recursive(json.source.files);


		return {
			api:    json.api,
			build:  json.build,
			source: json.source
		};

	};

	var _sort_recursive = function(obj) {

		if (obj instanceof Array) {

			return obj.sort();

		} else if (obj instanceof Object) {

			for (var prop in obj) {
				obj[prop] = _sort_recursive(obj[prop]);
			}

			return Object.sort(obj);

		} else {

			return obj;

		}

	};

	var _walk_directory = function(pointer, path) {

		var that = this;
		var name = path.split('/').pop();

		var info = this.info(path);
		if (info !== null) {

			if (info.type === 'file') {

				var identifier = path.split('/').pop().split('.')[0];
				var attachment = path.split('/').pop().split('.').slice(1).join('.');

				// Music and Sound asset have a trailing mp3 or ogg
				// extension which is dynamically chosen at runtime
				var ext = attachment.split('.').pop();
				if (ext.match(/mp3|ogg/)) {
					attachment = attachment.split('.').slice(0, -1).join('.');
					ext        = attachment.split('.').pop();
				}

				if (ext.match(/msc|snd|js|json|fnt|png|md|tpl/)) {

					if (pointer[identifier] instanceof Array) {

						if (pointer[identifier].indexOf(attachment) === -1) {
							pointer[identifier].push(attachment);
						}

					} else {
						pointer[identifier] = [ attachment ];
					}

				}

			} else if (info.type === 'directory') {

				pointer[name] = {};

				this.dir(path).forEach(function(child) {
					_walk_directory.call(that, pointer[name], path + '/' + child);
				});

			}

		}

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
				'reference': 'harvester.mod.Packager',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		can: function(project) {

			if (project.identifier.indexOf('__') === -1 && project.package !== null && project.filesystem !== null) {

				var diff_a = JSON.stringify(project.package.json);
				var diff_b = JSON.stringify(_serialize(project));
				if (diff_a !== diff_b) {
					return true;
				}

			}


			return false;

		},

		process: function(project) {

			if (project.package !== null) {

				var data = _serialize(project);
				var blob = JSON.stringify(data, null, '\t');
				if (blob !== null) {
					project.filesystem.write('/lychee.pkg', blob);
					project.package = new _Package(new Buffer(blob, 'utf8'));
				}

			}

		}

	};


	return Module;

});

