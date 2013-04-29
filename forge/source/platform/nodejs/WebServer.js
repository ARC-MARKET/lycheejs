
lychee.define('game.WebServer').tags({
	platform: 'nodejs'
}).requires([
	'game.webserver.mod.FS',
	'game.webserver.mod.Error',
	'game.webserver.mod.File',
	'game.webserver.mod.Redirect',
	'game.webserver.mod.Welcome'
]).supports(function(lychee, global) {

	if (
		typeof process !== 'undefined'
	) {
		return true;
	}


	return false;

}).exports(function(lychee, global) {

	var http = require('http');
	var zlib = require('zlib');

	var _template = game.webserver.Template;
	var _mod = game.webserver.mod;



	/*
	 * AUTONOMOUS WEBSERVER
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.__host = typeof settings.host === 'string' ? settings.host : null;
		this.__port = typeof settings.port === 'number' ? settings.port : 8080;
		this.__root = typeof settings.root === 'string' ? settings.root : '/var/www';


		this.__mods          = {};
		this.__mods.fs       = new _mod['FS'](this);
		this.__mods.error    = new _mod['Error'](this);

		this.__mods.file     = new _mod['File'](this);
		this.__mods.redirect = new _mod['Redirect'](this);
		this.__mods.welcome  = new _mod['Welcome'](this);

		this.__mods.fs.walk(this.__root);


		if (lychee.debug === true) {
			console.log('game.WebServer: Listening on ' + this.__host + ':' + this.__port);
		}


		var that = this;

		this.__server = http.createServer(function(request, response) {

			var accept_encoding = request.headers['accept-encoding'] || "";

			that.__handleRequest(request, function(data) {


				if (accept_encoding.match(/\bgzip\b/)) {

					data.header['Content-Encoding'] = 'gzip';
					response.writeHead(data.status, data.header);

					zlib.gzip(data.body, function(err, buffer) {

						if (!err) { response.write(buffer); }
						response.end();

					});

				} else {

					data.header['Content-Length'] = data.body.length;

					response.writeHead(data.status, data.header);
					response.write(data.body);
					response.end();

				}

			});

		});


		this.__server.listen(this.__port);


/*
		this.__mods.fs.add(
			this.__root, 'game/jewelz',
			game.webserver.mod.FS.TYPE.link,
			this.__root + '/alias'
		);
*/

	};


	Class.VERSION = 'lycheeJS ' + lychee.VERSION + ' WebServer (running on NodeJS)';


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		getHost: function() {
			return this.__host;
		},

		getMod: function(id) {

			if (this.__mods[id]) {
				return this.__mods[id];
			}


			return null;

		},

		getPort: function() {
			return this.__port;
		},

		getRoot: function() {
			return this.__root;
		},

		getVersion: function() {
			return Class.VERSION;
		},

		__handleRequest: function(request, callback) {

			var error    = this.getMod('error');
			var fs       = this.getMod('fs');
			var file     = this.getMod('file');
			var redirect = this.getMod('redirect');
			var welcome  = this.getMod('welcome');


			var url = request.url;
			var resolved = null;
			if (fs !== null) {

				resolved = fs.resolve(this.__root + url);


				if (lychee.debug === true) {
					console.log('Handling Request: ' + this.__root + url + ' <> ' + resolved);
				}


				if (url === '/') {

					welcome.execute(url, callback);

				} else if (resolved !== null) {

					if (
						fs.isDirectory(resolved) === true
						&& fs.isFile(resolved + '/index.html') === true
					) {
						redirect.execute(resolved + '/index.html', callback);
					} else if (fs.isFile(resolved) === true) {
						file.execute(resolved, callback);
					} else {
						error.execute(403, url, callback);
					}

				} else {
					// TODO: Evaluate if alternative redirect makes more sense
					error.execute(404, url, callback);
				}

			} else {
				error.execute(500, url, callback);
			}

		}

	};


	return Class;

});

