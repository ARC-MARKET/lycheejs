
lychee.define('game.webserver.mod.File').requires([
	'game.webserver.Template'
]).exports(function(lychee, global) {

	var Class = function(webserver) {

		this.__webserver = webserver;

	};


	Class.MIME = {

		'default': { encoding: 'binary', type: 'application/octet-stream' },

		'html':    { encoding: 'utf8',   type: 'text/html' },
		'css':     { encoding: 'utf8',   type: 'text/css' },
		'js':      { encoding: 'utf8',   type: 'application/javascript' },
		'json':    { encoding: 'utf8',   type: 'application/json' },

		'png':     { encoding: 'binary', type: 'image/png' },
		'mp3':     { encoding: 'binary', type: 'audio/mp3' },
		'ogg':     { encoding: 'binary', type: 'application/ogg' }

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		execute: function(url, callback) {

			var tmp1 = url.split('/');
			var tmp2 = tmp1[tmp1.length - 1].split('.');


			var mime = Class.MIME['default'];

			var extension = tmp2[tmp2.length - 1];
			if (Class.MIME[extension] !== undefined) {
				mime = Class.MIME[extension];
			}



			var response = {
				status: 200,
				header: {
					'Cache-Control': 'no-transform',
					'Content-Type':  mime.type,
					'Vary':          'Accept-Encoding'
				},
				body: ''
			};


			var errormod = this.__webserver.getMod('error');
			var fsmod    = this.__webserver.getMod('fs');
			if (fsmod !== null) {

				fsmod.read(url, function(data, modtime) {

					var expires = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days

					response.header['Expires']       = new Date(expires).toUTCString();
					response.header['Last-Modified'] = modtime;


					if (data === null) {

						if (errormod !== null) {
							errormod.execute(403, url, callback);
						}

					} else {

						response.body = data;
						callback(response);

					}

				}, this);

			} else {

				errormod.execute(500, url, callback);

			}

		}

	};


	return Class;

});

