
lychee.define('harvester.data.Package').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _parse_buffer = function() {

		var json = JSON.parse(this.buffer.toString());
		if (json instanceof Object) {

			if (json.api instanceof Object) {

				if (json.api.files instanceof Object) {
					_walk_directory(this.api, json.api.files, '');
				}

			} else {

				json.api = {
					files: {}
				};

			}


			if (json.build instanceof Object) {

				if (json.build.files instanceof Object) {
					_walk_directory(this.build, json.build.files, '');
				}

			} else {

				json.build = {
					environments: {},
					files:        {}
				};

			}


			if (json.source instanceof Object) {

				if (json.source.files instanceof Object) {
					_walk_directory(this.source, json.source.files, '');
				}

			} else {

				json.source = {
					environments: {},
					files:        {},
					tags:         {}
				};

			}


			this.json = json;

		}

	};

	var _walk_directory = function(files, node, path) {

		if (node instanceof Array) {

			node.forEach(function(ext) {

				if (ext.match(/msc|snd/)) {

					if (files.indexOf(path + '.' + ext) === -1) {
						files.push(path + '.' + ext);
					}

				} else if (ext.match(/js|json|fnt|png/)) {

					if (files.indexOf(path + '.' + ext) === -1) {
						files.push(path + '.' + ext);
					}

				} else if (ext.match(/md/)) {

					if (files.indexOf(path + '.' + ext) === -1) {
						files.push(path + '.' + ext);
					}

				}

			});

		} else if (node instanceof Object) {

			Object.keys(node).forEach(function(child) {
				_walk_directory(files, node[child], path + '/' + child);
			});

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(buffer) {

		this.buffer = null;

		this.api    = [];
		this.build  = [];
		this.source = [];
		this.json   = {};


		this.setBuffer(buffer);


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var buffer = lychee.deserialize(blob.buffer);
			if (buffer !== null) {
				this.setBuffer(buffer);
			}

		},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'harvester.data.Package';


			var settings = {};
			var blob     = data['blob'] || {};


			if (this.buffer !== null) blob.buffer = lychee.serialize(this.buffer);


			data['arguments'][0] = null;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setBuffer: function(buffer) {

			buffer = buffer instanceof Buffer ? buffer : null;


			if (buffer !== null) {

				this.buffer = buffer;
				_parse_buffer.call(this);


				return true;

			}


			return false;

		}

	};


	return Class;

});

