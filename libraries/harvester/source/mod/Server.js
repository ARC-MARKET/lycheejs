
lychee.define('harvester.mod.Server').requires([
	'harvester.data.Project',
	'harvester.data.Server'
]).exports(function(lychee, global, attachments) {

	var _MIN_PORT      = 49152;
	var _MAX_PORT      = 65534;
	var _LOG_PROJECT   = null;
	var _ROOT          = lychee.ROOT.lychee;

	var _child_process = require('child_process');
	var _net           = require('net');
	var _port          = _MIN_PORT;
	var _Server        = lychee.import('harvester.data.Server');



	/*
	 * HELPERS
	 */

	var _report_error = function(text) {

		var lines   = text.split('\n');
		var line    = null;
		var file    = null;
		var message = null;


		if (lines.length > 0) {

			if (lines[0].indexOf(':') !== -1) {

				file = lines[0].split(':')[0];
				line = lines[0].split(':')[1];

			}


			lines.forEach(function(line) {

				var err = line.substr(0, line.indexOf(':'));
				if (err.match(/Error/g)) {
					message = line.trim();
				}

			});

		}


		if (file !== null && line !== null) {
			console.error('harvester.mod.Server: Report from ' + file + '#L' + line + ':');
			console.error('                      "' + message + '"');
		}

	};

	var _scan_port = function(callback, scope) {

		callback = callback instanceof Function ? callback : null;
		scope    = scope !== undefined          ? scope    : this;


		if (callback !== null) {

			var socket = new _net.Socket();
			var status = null;
			var port   = _port++;


			socket.setTimeout(100);

			socket.on('connect', function() {
				status = 'used';
				socket.destroy();
			});

			socket.on('timeout', function(err) {
				status = 'free';
				socket.destroy();
			});

			socket.on('error', function(err) {

				if (err.code === 'ECONNREFUSED') {
					status = 'free';
				} else {
					status = 'used';
				}

				socket.destroy();

			});

			socket.on('close', function(err) {

				if (status === 'free') {
					callback.call(scope, port);
				} else if (status === 'used') {
					_scan_port(callback, scope);
				} else {
					callback.call(scope, null);
				}

			});


			socket.connect(port, '127.0.0.1');

		}

	};

	var _serve = function(project, host, port) {

		console.info('harvester.mod.Server: BOOTUP ("' + project + ' | ' + host + ':' + port + '")');


		var server = null;

		try {

			server = _child_process.execFile(_ROOT + '/bin/helper.sh', [
				'env:node',
				_ROOT + project + '/harvester.js',
				_ROOT,
				port,
				host
			], {
				cwd: _ROOT + project
			}, function(error, stdout, stderr) {

				stderr = (stderr.trim() || '').toString();


				if (error !== null && error.signal !== 'SIGTERM') {

					_LOG_PROJECT = project;
					console.error('harvester.mod.Server: FAILURE ("' + project + ' | ' + host + ':' + port + '")');
					console.error(stderr);

				} else if (stderr !== '') {

					_LOG_PROJECT = project;
					console.error('harvester.mod.Server: FAILURE ("' + project + ' | ' + host + ':' + port + '")');
					_report_error(stderr);

				}

			});

			server.stdout.on('data', function(lines) {

				lines = lines.trim().split('\n').filter(function(message) {

					if (message.charAt(0) !== '\u001b') {
						return true;
					}

					return false;

				});

				if (lines.length > 0) {

					if (_LOG_PROJECT !== project) {
						console.log('harvester.mod.Server: LOG ("' + project + '")');
						_LOG_PROJECT = project;
					}

					lines.forEach(function(message) {
						console.log('                      ' + message.trim());
					});

				}

			});

			server.stderr.on('data', function(lines) {

				lines = lines.trim().split('\n').filter(function(message) {

					if (message.charAt(0) === '\u001b') {
						return true;
					}

					return false;

				}).map(function(message) {

					if (message.charAt(0) === '\u001b') {
						message = message.substr(12);

						if (message.charAt(message.length - 1) === 'm') {
							message = message.substr(0, message.length - 12);
						}

					}

					return message;

				});


				if (lines.length > 0) {

					if (_LOG_PROJECT !== project) {
						console.error('harvester.mod.Server: ERROR ("' + project + '")');
						_LOG_PROJECT = project;
					}

					lines.forEach(function(message) {
						console.error('                      ' + message.trim());
					});

				}

			});

			server.on('error', function() {

				console.warn('harvester.mod.Server: SHUTDOWN ("' + project + ' | ' + host + ':' + port + '")');

				this.kill('SIGTERM');

			});

			server.on('exit', function() {
			});

			server.destroy = function() {

				console.warn('harvester.mod.Server: SHUTDOWN ("' + project + ' | ' + host + ':' + port + '")');

				this.kill('SIGTERM');

			};

		} catch(err) {

			server = null;

		}

		return server;

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
				'reference': 'harvester.mod.Server',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		can: function(project) {

			if (project.identifier.indexOf('__') === -1 && project.server === null) {

				var info = project.filesystem.info('/harvester.js');
				if (info !== null && info.type === 'file') {
					return true;
				}

			}


			return false;

		},

		process: function(project) {

			if (project.server === null) {

				var info = project.filesystem.info('/harvester.js');
				if (info !== null && info.type === 'file') {

					_scan_port(function(port) {

						if (port >= _MIN_PORT && port <= _MAX_PORT) {

							var server = _serve(project.identifier, null, port);
							if (server !== null) {

								project.setServer(new _Server({
									process: server,
									host:    null,
									port:    port
								}));

							} else {

								console.error('harvester.mod.Server: FAILURE ("' + project.identifier + ' | null:' + port + '") (chmod +x missing?)');

							}

						}

					}, this);

				}

			}

		}

	};


	return Module;

});

