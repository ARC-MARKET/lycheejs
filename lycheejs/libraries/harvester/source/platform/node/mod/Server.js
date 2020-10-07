
lychee.define('harvester.mod.Server').tags({
	platform: 'node'
}).requires([
	'harvester.data.Project',
	'harvester.data.Server'
]).supports((lychee, global) => {

	if (typeof global.require === 'function') {

		try {

			global.require('child_process');
			global.require('net');

			return true;

		} catch (err) {

		}

	}


	return false;

}).exports((lychee, global, attachments) => {

	const _child_process = global.require('child_process');
	const _net           = global.require('net');
	const _Project       = lychee.import('harvester.data.Project');
	const _Server        = lychee.import('harvester.data.Server');
	const _BINARY        = process.execPath;
	const _MIN_PORT      = 49152;
	let   _CUR_PORT      = _MIN_PORT;
	const _MAX_PORT      = 65534;
	const _ROOT          = lychee.ROOT.lychee;



	/*
	 * HELPERS
	 */

	const _OFFSET  = new Array('harvester.mod.Server: '.length).fill(' ').join('');
	const _MESSAGE = {
		prefixes: [ '(L)', '(I)', '(W)', '(E)' ],
		consoles: [ console.log, console.info, console.warn, console.error ]
	};

	const _on_message = function(raw) {

		let prefix = '\u001b[41m\u001b[97m';
		let suffix = '\u001b[39m\u001b[49m\u001b[0m';
		let lines  = raw.trim().split('\n');
		let last   = null;

		for (let l = 0, ll = lines.length; l < ll; l++) {

			let line = lines[l].trim();
			if (line.startsWith('\u001b')) {
				line = line.substr(prefix.length, line.length - prefix.length).trim();
			}

			if (line.endsWith('\u001b[0m')) {
				line = line.substr(0, line.length - suffix.length).trim();
			}


			let type = line.substr(0, 3);
			if (_MESSAGE.prefixes.includes(type)) {
				line = line.substr(3).trim();
				last = type;
			}


			if (line.length > 0) {
				this.push(last + ' ' + line);
			}

		}

	};

	const _report_error = function(text) {

		let lines   = text.split('\n');
		let line    = null;
		let file    = null;
		let message = null;


		if (lines.length > 0) {

			if (lines[0].indexOf(':') !== -1) {

				file = lines[0].split(':')[0];
				line = lines[0].split(':')[1];

			}


			lines.forEach(line => {

				let err = line.substr(0, line.indexOf(':'));
				if (/Error/g.test(err)) {
					message = line.trim();
				}

			});

		}


		if (file !== null && line !== null) {
			console.error('harvester.mod.Server: Report from ' + file + '#L' + line + ':');
			console.error('                      "' + message + '"');
		}

	};

	const _scan_port = function(callback, scope) {

		callback = callback instanceof Function ? callback : null;
		scope    = scope !== undefined          ? scope    : this;


		if (callback !== null) {

			let socket = new _net.Socket();
			let status = null;
			let port   = _CUR_PORT++;


			socket.setTimeout(100);

			socket.on('connect', _ => {
				status = 'used';
				socket.destroy();
			});

			socket.on('timeout', _ => {
				status = 'free';
				socket.destroy();
			});

			socket.on('error', err => {

				if (err.code === 'ECONNREFUSED') {
					status = 'free';
				} else {
					status = 'used';
				}

				socket.destroy();

			});

			socket.on('close', err => {

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

	const _serve = function(project, port) {

		port = typeof port === 'number' ? port : null;


		let handle = null;

		if (port !== null && port >= _MIN_PORT && port <= _MAX_PORT) {

			let info = '"' + project + '" | "*:' + port + '"';

			console.info('harvester.mod.Server: BOOTUP (' + info + ')');


			try {

				let stdout = [];
				let stderr = [];
				let args   = [
					_ROOT + project + '/harvester.js',
					port,
					'null'
				];

				if (lychee.debug === true) {
					args.push('--debug');
				}

				// XXX: Alternative (_ROOT + '/bin/helper/helper.sh', [ 'env:node', file, port, host ])
				handle = _child_process.execFile(_BINARY, args, {
					cwd: _ROOT + project
				}, error => {

					if (stderr.length > 0) {

						console.error('harvester.mod.Server: FAILURE (' + info + ')');

						if (lychee.debug === true) {

							for (let s = 0, sl = stdout.length; s < sl; s++) {

								let line  = stdout[s];
								let type  = line.substr(0, 3);
								let chunk = _OFFSET + line.substr(3).trim();

								let index = _MESSAGE.prefixes.indexOf(type);
								if (index !== -1) {
									_MESSAGE.consoles[index].call(console, chunk);
								}

							}

						}

						for (let s = 0, sl = stderr.length; s < sl; s++) {

							let line  = stderr[s];
							let type  = line.substr(0, 3);
							let chunk = _OFFSET + line.substr(3).trim();

							let index = _MESSAGE.prefixes.indexOf(type);
							if (index !== -1) {
								_MESSAGE.consoles[index].call(console, chunk);
							}

						}

					}

				});

				handle.stdout.on('data', raw => _on_message.call(stdout, raw));
				handle.stderr.on('data', raw => _on_message.call(stderr, raw));

				handle.on('error', _ => {
					console.warn('harvester.mod.Server: SHUTDOWN (' + info + ')');
					handle.kill('SIGTERM');
				});

				handle.on('exit', _ => {});

				handle.destroy = _ => {
					console.warn('harvester.mod.Server: SHUTDOWN (' + info + ')');
					handle.kill('SIGTERM');
				};

			} catch (err) {

				handle = null;

			}

		}


		return handle;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

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

			project = project instanceof _Project ? project : null;


			if (project !== null) {

				if (project.identifier.indexOf('__') === -1 && project.server === null) {

					let info = project.filesystem.info('/harvester.js');
					if (info !== null && info.type === 'file') {
						return true;
					}

				}

			}


			return false;

		},

		process: function(project) {

			project = project instanceof _Project ? project : null;


			if (project !== null) {

				if (project.server === null) {

					let info = project.filesystem.info('/harvester.js');
					if (info !== null && info.type === 'file') {

						_scan_port(port => {

							let server = _serve(project.identifier, port);
							if (server !== null) {

								project.setServer(new _Server({
									process: server,
									host:    null,
									port:    port
								}));

							}

						}, this);


						return true;

					}

				}

			}


			return false;

		}

	};


	return Module;

});

