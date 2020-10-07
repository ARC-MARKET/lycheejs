
lychee.define('harvester.Main').requires([
	'harvester.net.Admin',
	'harvester.net.Server',
	'harvester.Watcher'
]).includes([
	'lychee.event.Emitter'
]).exports((lychee, global, attachments) => {

	const _harvester     = lychee.import('harvester');
	const _clearInterval = global.clearInterval || function() {};
	const _setInterval   = global.setInterval;
	const _Emitter       = lychee.import('lychee.event.Emitter');
	const _INTERFACES    = (function() {

		let os = null;

		try {
			os = require('os');
		} catch (err) {
		}


		if (os !== null) {

			let candidates = [];

			Object.values(os.networkInterfaces()).forEach(iface => {

				iface.forEach(alias => {

					if (alias.internal === false) {

						if (alias.family === 'IPv6' && alias.scopeid === 0) {
							candidates.push(alias.address);
						} else if (alias.family === 'IPv4') {
							candidates.push(alias.address);
						}

					}

				});

			});

			return candidates.unique();

		}


		return [];

	})();



	/*
	 * HELPERS
	 */

	const _is_public = function(host) {

		if (host === '::1' || host === 'localhost') {

			return false;

		} else if (/:/g.test(host) === true) {

			let tmp = host.split(':');
			if (tmp[0] !== '') {

				let tmp2 = parseInt(tmp[0], 16);
				if (tmp2 === 64512) {

					return false;

				} else if (tmp2 >= 65152 && tmp2 <= 65215) {

					return false;

				}

			}

		} else if (/\./g.test(host) === true) {

			let tmp = host.split('.');

			if (tmp[0] === '10') {

				return false;

			} else if (tmp[0] === '192' && tmp[1] === '168') {

				return false;

			} else if (tmp[0] === '172') {

				let tmp2 = parseInt(tmp[1], 10);
				if (!isNaN(tmp2) && tmp2 >= 16 && tmp2 <= 31) {
					return false;
				}

			}

		}


		return true;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.settings = lychee.assignsafe({
			debug:   false,
			host:    'localhost',
			port:    8080,
			sandbox: false
		}, states);


		let debug = this.settings.debug;
		if (debug === true) {
			console.log('harvester.Main: Parsed settings are ...');
			console.log(this.settings);
		}


		// Updated by Watcher instance
		this._libraries = {};
		this._projects  = {};

		this.admin   = null;
		this.server  = null;
		this.watcher = new _harvester.Watcher(this);

		this.__interval = null;


		_Emitter.call(this);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function() {

			let host = this.settings.host;
			let port = this.settings.port;


			this.admin  = new _harvester.net.Admin({
				host: null,
				port: 4848
			});

			this.server = new _harvester.net.Server({
				host: host === 'localhost' ? null : host,
				port: port
			});

		}, this, true);

		this.bind('init', function() {

			this.admin.connect();
			this.server.connect();


			console.log('');
			console.info('harvester.Main: +-------------------------------------------------------+');
			console.info('harvester.Main: | Open one of these URLs with a Blink-based Web Browser |');
			console.info('harvester.Main: +-------------------------------------------------------+');
			console.log('');
			this.getHosts().forEach(host => console.log('harvester.Main: ' + host));
			console.log('');

		}, this, true);

		this.bind('init', function() {

			let watcher = this.watcher || null;
			if (watcher !== null) {

				watcher.init();

				this.__interval = _setInterval(_ => watcher.update(), 30000);

			}

		}, this, true);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			let admin = lychee.deserialize(blob.admin);
			if (admin !== null) {
				this.admin = admin;
			}


			let server = lychee.deserialize(blob.server);
			if (server !== null) {
				this.server = server;
			}

		},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'harvester.Main';


			let states = lychee.assignunlink({}, this.settings);
			let blob   = data['blob'] || {};


			if (this.admin !== null)  blob.admin  = lychee.serialize(this.admin);
			if (this.server !== null) blob.server = lychee.serialize(this.server);


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * MAIN API
		 */

		init: function() {

			this.trigger('load');
			this.trigger('init');

			return true;

		},

		destroy: function() {

			for (let pid in this._projects) {

				let project = this._projects[pid];
				if (project.server !== null) {

					if (typeof project.server.destroy === 'function') {
						project.server.destroy();
					}

				}

			}


			if (this.admin !== null) {
				this.admin.disconnect();
				this.admin = null;
			}

			if (this.server !== null) {
				this.server.disconnect();
				this.server = null;
			}

			if (this.__interval !== null) {
				_clearInterval(this.__interval);
				this.__interval = null;
			}


			this.trigger('destroy');

			return true;

		},



		/*
		 * CUSTOM API
		 */

		getHosts: function() {

			let filtered = [];

			let server = this.server;
			if (server !== null) {

				let host = server.host || null;
				let port = server.port;
				if (host === null) {

					for (let i = 0, il = _INTERFACES.length; i < il; i++) {

						let iface = _INTERFACES[i];
						if (/:/g.test(iface)) {
							filtered.push('http://[' + iface + ']:' + port);
						} else {
							filtered.push('http://' + iface + ':' + port);
						}

					}

					filtered.push('http://localhost:' + port);

				} else {

					if (/:/g.test(host)) {
						filtered.push('http://[' + host + ']:' + port);
					} else {
						filtered.push('http://' + host + ':' + port);
					}

				}

			}


			return filtered;

		},

		getNetworks: function() {

			let networks = [];
			let server   = null;

			if (server !== null) {

				let host = server.host || null;
				let port = server.port;

				if (_is_public(host) === true) {
					networks.push((/:/g.test(host) ? '[' + host + ']' : host) + ':' + port);
				}

				networks.push.apply(networks, _INTERFACES.filter(_is_public).map(host => {
					return (/:/g.test(host) ? '[' + host + ']' : host) + ':' + port;
				}));

			}


			return networks;

		}

	};


	return Composite;

});

