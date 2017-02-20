
lychee.define('harvester.Main').requires([
	'lychee.Input',
	'harvester.net.Admin',
	'harvester.net.Server',
	'harvester.Watcher'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

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

			Object.values(os.networkInterfaces()).forEach(function(iface) {

				iface.forEach(function(alias) {

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

			// TODO: Detect private IPv6 ranges?

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

	let Composite = function(settings) {

		this.settings = lychee.assignunlink({ host: null, port: null, sandbox: false }, settings);
		this.defaults = lychee.assignunlink({}, this.settings);


		// Updated by Watcher instance
		this._libraries = {};
		this._projects  = {};

		this.admin   = null;
		this.server  = null;
		this.watcher = new _harvester.Watcher(this);

		this.__interval = null;


		settings.host    = typeof settings.host === 'string' ? settings.host       : null;
		settings.port    = typeof settings.port === 'number' ? (settings.port | 0) : 8080;
		settings.sandbox = settings.sandbox === true;


		_Emitter.call(this);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function() {

			this.admin  = new _harvester.net.Admin({
				host: null,
				port: 4848
			});

			this.server = new _harvester.net.Server({
				host: settings.host === 'localhost' ? null : settings.host,
				port: settings.port
			});

		}, this, true);

		this.bind('init', function() {

			this.admin.connect();
			this.server.connect();


			console.log('\n');
			console.info('+-------------------------------------------------------+');
			console.info('| Open one of these URLs with a Blink-based Web Browser |');
			console.info('+-------------------------------------------------------+');
			console.log('\n');
			this.getHosts().forEach(function(host) {
				console.log(host);
			});
			console.log('\n\n');

		}, this, true);


		this.bind('init', function() {

			let watcher = this.watcher || null;
			if (watcher !== null) {

				watcher.init(settings.sandbox);

				this.__interval = _setInterval(function() {
					watcher.update();
				}.bind(this), 30000);

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


			let settings = lychee.assignunlink({}, this.settings);
			let blob     = data['blob'] || {};


			if (this.admin !== null)  blob.admin  = lychee.serialize(this.admin);
			if (this.server !== null) blob.server = lychee.serialize(this.server);


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * MAIN API
		 */

		init: function() {

			this.trigger('load');
			this.trigger('init');

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

		},



		/*
		 * CUSTOM API
		 */

		getHosts: function() {

			let hosts  = [];
			let server = this.server;

			if (server !== null) {

				let host = server.host || null;
				let port = server.port;

				if (host === null) {
					hosts.push.apply(hosts, _INTERFACES);
					hosts.push('localhost');
				} else {
					hosts.push(host);
				}


				hosts = hosts.map(function(host) {

					if (/:/g.test(host)) {
						return 'http://[' + host + ']:' + port;
					} else {
						return 'http://' + host + ':' + port;
					}

				});

			}


			return hosts;

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

				networks.push.apply(networks, _INTERFACES.filter(_is_public).map(function(host) {
					return (/:/g.test(host) ? '[' + host + ']' : host) + ':' + port;
				}));

			}


			return networks;

		}

	};


	return Composite;

});

