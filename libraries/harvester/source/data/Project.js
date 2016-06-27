
lychee.define('harvester.data.Project').requires([
	'harvester.data.Filesystem',
	'harvester.data.Package',
	'harvester.data.Server'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	var _Filesystem = lychee.import('harvester.data.Filesystem');
	var _Package    = lychee.import('harvester.data.Package');
	var _Server     = lychee.import('harvester.data.Server');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(identifier) {

		identifier = typeof identifier === 'string' ? identifier : null;


		this.identifier = identifier;
		this.filesystem = new _Filesystem(identifier);
		this.package    = new _Package(this.filesystem.read('/lychee.pkg'));
		this.server     = null;
		this.harvester  = this.filesystem.info('/harvester.js') !== null;


		lychee.event.Emitter.call(this);

	};




	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'harvester.data.Project';


			var settings = data['arguments'] || {};
			var blob     = data['blob'] || {};


			if (this.filesystem !== null) blob.filesystem = lychee.serialize(this.filesystem);
			if (this.package !== null)    blob.package    = lychee.serialize(this.package);
			if (this.server !== null)     blob.server     = lychee.serialize(this.server);


			data['arguments'] = [ this.identifier ];
			data['blob']      = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setPackage: function(package) {

			package = package instanceof _Package ? package : null;


			if (package !== null) {

				this.package = package;

				return true;

			}


			return false;

		},

		setServer: function(server) {

			server = server instanceof _Server ? server : null;


			if (server !== null) {

				this.server = server;

				return true;

			}


			return false;

		}

	};


	return Class;

});

