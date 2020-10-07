
lychee.define('harvester.data.Package').exports((lychee, global, attachments) => {

	/*
	 * HELPERS
	 */

	const _parse_buffer = function() {

		let json = null;

		try {
			json = JSON.parse(this.buffer.toString('utf8'));
		} catch (err) {
		}


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


			if (json.review instanceof Object) {

				if (json.review.files instanceof Object) {
					_walk_directory(this.review, json.review.files, '');
				}

			} else {

				json.review = {
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

	const _walk_directory = function(files, node, path) {

		if (node instanceof Array) {

			node.forEach(ext => {

				if (/(msc|snd)$/.test(ext)) {

					if (files.indexOf(path + '.' + ext) === -1) {
						files.push(path + '.' + ext);
					}

				} else if (/(js|json|fnt|png)$/.test(ext)) {

					if (files.indexOf(path + '.' + ext) === -1) {
						files.push(path + '.' + ext);
					}

				} else if (/(md|tpl)$/.test(ext)) {

					if (files.indexOf(path + '.' + ext) === -1) {
						files.push(path + '.' + ext);
					}

				}

			});

		} else if (node instanceof Object) {
			Object.keys(node).forEach(child => _walk_directory(files, node[child], path + '/' + child));
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.buffer = null;

		this.api    = [];
		this.build  = [];
		this.review = [];
		this.source = [];
		this.json   = {};


		this.setBuffer(states.buffer);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			let buffer = lychee.deserialize(blob.buffer);
			if (buffer !== null) {
				this.setBuffer(buffer);
			}

		},

		serialize: function() {

			let blob = {};


			if (this.buffer !== null) blob.buffer = lychee.serialize(this.buffer);


			return {
				'constructor': 'harvester.data.Package',
				'arguments':   [ null ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

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


	return Composite;

});

