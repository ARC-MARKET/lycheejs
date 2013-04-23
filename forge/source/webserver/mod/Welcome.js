
lychee.define('game.webserver.mod.Welcome').requires([
	'game.webserver.Template'
]).exports(function(lychee, global, attachments) {

	var _html     = attachments['html'] || null;
	var _template = game.webserver.Template;


	var Class = function(webserver) {

		this.__template  = null;
		this.__webserver = webserver;


		if (_html !== null) {
			this.__template = new _template(_html);
		}

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		execute: function(url, callback) {

			var webserver = this.__webserver;


			var content = '';

			if (this.__template !== null) {

				var host    = webserver.getHost();
				var port    = webserver.getPort();
				var version = webserver.getVersion();


				try {

					content = this.__template.render({

						games_list: this.__generateGamesList(),

						webserver_host: host,
						webserver_port: port,
						webserver_version: version

					});

				} catch(e) {

					content = '';

				}

			}


			callback({
				status: 200,
				header: {
					'Content-Type':   'text/html'
				},
				body: content
			});

		},



		/*
		 * PRIVATE API
		 */

		__generateGamesList: function() {

			var games = [];

			var fsmod = this.__webserver.getMod('fs');
			if (fsmod !== null) {

				var root = this.__webserver.getRoot();

				var files = fsmod.filter(
					root + '/game',
					'index.html',
					game.webserver.mod.FS.TYPE.file
				);


				for (var f = 0, fl = files.length; f < fl; f++) {

					var url = files[f].substr(root.length);
					var tmp = url.split('/');
					tmp.splice(tmp.length - 1, 1); // remove index.html

					games.push({
						url: url,
						title: tmp.join('/')
					});

				}

			}


			return games;

		}

	};


	return Class;

});

