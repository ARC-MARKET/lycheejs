#!/usr/local/bin/lycheejs-helper env:node

const _child_process = require('child_process');
const _fs            = require('fs');
const _path          = require('path');
const _BINARY        = process.execPath;
const _SELF          = process.argv[1];
const _PROCESSES     = [];
const _ROOT          = process.env.LYCHEEJS_ROOT || '/opt/lycheejs';
const lychee         = require(_ROOT + '/libraries/crux/build/node/dist.js')(_ROOT);
let   _MULTI_MODE    = false;

if (process.argv.includes('--autocomplete')) {
	console.log   = function() {};
	console.info  = function() {};
	console.warn  = function() {};
	console.error = function() {};
}



/*
 * USAGE
 */

const _print_autocomplete = function(action, project, target, flag1, flag2) {

	let actions   = [ 'build', 'configure', 'package', 'fertilize', 'publish' ];
	let flags     = [ '--debug', '--sandbox' ];
	let libraries = _fs.readdirSync(_ROOT + '/libraries')
		.sort()
		.map(val => '/libraries/' + val)
		.filter(val => _fs.existsSync(_ROOT + val + '/lychee.pkg'));
	let projects  = _fs.readdirSync(_ROOT + '/projects')
		.sort()
		.map(val => '/projects/' + val)
		.filter(val => _fs.existsSync(_ROOT + val + '/lychee.pkg'));
	let targets   = [];


	let suggestions = [];
	let has_action  = actions.find(a => a === action);
	let has_project = libraries.find(l => l === project) || projects.find(p => p === project);
	let has_flag1   = flags.find(f => f === flag1);
	let has_flag2   = flags.find(f => f === flag2);

	if (has_project !== undefined) {

		try {

			let buffer = _fs.readFileSync(_ROOT + project + '/lychee.pkg', 'utf8');
			if (buffer !== '') {

				let data = null;
				try {
					data = JSON.parse(buffer);
				} catch (err) {
					data = null;
				}

				if (
					data instanceof Object
					&& data.build instanceof Object
					&& data.build.environments instanceof Object
				) {
					targets = Object.keys(data.build.environments);
				}

			}

		} catch (err) {
		}

	}

	let has_target = targets.find(t => t === target);


	if (has_action && has_project && has_target && has_flag1 && has_flag2) {
		// Nothing to suggest
	} else if (has_action && has_project && has_target && has_flag1 && flag2) {
		suggestions = flags.filter(f => f.startsWith(flag2));
	} else if (has_action && has_project && has_target && has_flag1) {
		suggestions = flags.filter(f => f !== flag1);
	} else if (has_action && has_project && has_target && flag1) {
		suggestions = flags.filter(f => f.startsWith(flag1));
	} else if (has_action && has_project && has_target) {
		suggestions = flags;
	} else if (has_action && has_project && target) {
		suggestions = targets.filter(t => t.startsWith(target));
	} else if (has_action && has_project) {
		suggestions = targets;
	} else if (has_action && project) {
		suggestions.push.apply(suggestions, libraries.filter(l => l.startsWith(project)));
		suggestions.push.apply(suggestions, projects.filter(p => p.startsWith(project)));
	} else if (has_action && action) {
		suggestions.push.apply(suggestions, libraries);
		suggestions.push.apply(suggestions, projects);
	} else if (action) {
		suggestions = actions.filter(a => a.startsWith(action));
	} else {
		suggestions = actions;
	}


	return suggestions.sort();

};

const _print_help = function() {

	let libraries = _fs.readdirSync(_ROOT + '/libraries')
		.sort()
		.map(val => '/libraries/' + val)
		.filter(val => _fs.existsSync(_ROOT + val + '/lychee.pkg'));
	let projects  = _fs.readdirSync(_ROOT + '/projects')
		.sort()
		.map(val => '/projects/' + val)
		.filter(val => _fs.existsSync(_ROOT + val + '/lychee.pkg'));


	console.log('');
	console.info('lychee.js ' + lychee.VERSION + ' Fertilizer');
	console.log('');
	console.log('Detected lychee.js Installation: "' + lychee.ROOT.lychee + '"');
	console.log('');
	console.log('Usage: lycheejs-fertilizer [Action] [Library/Project] [Target] [Flag]');
	console.log('');
	console.log('');
	console.log('Available Actions:');
	console.log('');
	console.log('    fertilize    Autonomously Fertilize a Project or Library.');
	console.log('');
	console.log('    configure    Configure a Project or Library.         ');
	console.log('    build        Build a Project or Library.             ');
	console.log('    package      Package and Bundle a Project or Library.');
	console.log('    publish      Publish a Project or Library.           ');
	console.log('');
	console.log('Available Libraries:');
	console.log('');
	libraries.forEach(library => console.log('    ' + library));
	console.log('');
	console.log('Available Projects:');
	console.log('');
	projects.forEach(project => console.log('    ' + project));
	console.log('');
	console.log('Available Flags:');
	console.log('');
	console.log('    --debug      Enable debug messages.                   ');
	console.log('    --sandbox    Enable sandbox with isolated environment.');
	console.log('');
	console.log('Examples:');
	console.log('');
	console.log('    # Autonomous mode                                             ');
	console.log('    lycheejs-fertilizer fertilize /projects/boilerplate;          ');
	console.log('');
	console.log('    # Autonomous by-target mode                                   ');
	console.log('    lycheejs-fertilizer fertilize /projects/boilerplate html/main;');
	console.log('    lycheejs-fertilizer fertilize /projects/boilerplate node/main;');
	console.log('');
	console.log('    # Manual step-by-step mode                                    ');
	console.log('    lycheejs-fertilizer configure /projects/boilerplate;          ');
	console.log('    lycheejs-fertilizer build /projects/boilerplate;              ');
	console.log('    lycheejs-fertilizer package /projects/boilerplate;            ');
	console.log('');
	console.log('    # Manual step-by-step-by-target mode                          ');
	console.log('    lycheejs-fertilizer configure /projects/boilerplate html/main;');
	console.log('    lycheejs-fertilizer build /projects/boilerplate html/main;    ');
	console.log('    lycheejs-fertilizer package /projects/boilerplate html/main;  ');
	console.log('');

};

const _bootup = function(settings) {

	console.info('BOOTUP (' + process.pid + ')');


	lychee.ROOT.project = lychee.ROOT.lychee + '/libraries/fertilizer';

	lychee.init(null);
	lychee.pkg('build', 'node/main', environment => {

		lychee.init(environment, {
			debug:   settings.debug === true,
			sandbox: settings.debug === true ? false : settings.sandbox === true
		}, sandbox => {

			if (sandbox !== null) {

				let lychee     = sandbox.lychee;
				let fertilizer = sandbox.fertilizer;


				// Show more debug messages
				lychee.debug = true;


				// This allows using #MAIN in JSON files
				sandbox.MAIN = new fertilizer.Main(settings);
				sandbox.MAIN.bind('destroy', code => process.exit(code));
				sandbox.MAIN.init();


				const _on_process_error = function() {
					sandbox.MAIN.destroy();
					process.exit(1);
				};

				process.on('SIGHUP',  _on_process_error);
				process.on('SIGINT',  _on_process_error);
				process.on('SIGQUIT', _on_process_error);
				process.on('SIGABRT', _on_process_error);
				process.on('SIGTERM', _on_process_error);
				process.on('error',   _on_process_error);
				process.on('exit',    code => {});

			} else {

				console.error('BOOTUP FAILURE');

				process.exit(1);

			}

		});

	});

};

const _settings_to_args = function(settings) {

	let args = [ _SELF ];

	if (settings.action !== null) {

		args.push(settings.action);

		if (settings.project !== null) {

			args.push(settings.project);

			if (settings.target !== null) {
				args.push(settings.target);
			}

		}

	}

	if (settings.debug === true) {
		args.push('--debug');
	}

	if (settings.sandbox === true) {
		args.push('--sandbox');
	}

	return args;

};

const _spawn = function(args) {

	if (args.includes('--debug')) {
		console.log('fertilizer: -> Spawning Worker "lycheejs-fertilizer ' + args.slice(1).join(' ') + '"');
	}


	try {

		let handle = _child_process.execFile(_BINARY, args, {
			cwd: _ROOT + args[2]
		}, (error, stdout, stderr) => {

			stdout = (stdout.toString() || '').trim();
			stderr = (stderr.toString() || '').trim();

			if (stderr !== '') {

				let lines = stderr.split('\n').map(message => {

					let prefix = '\u001b[41m\u001b[97m';
					let suffix = '\u001b[39m\u001b[49m\u001b[0m';

					if (message.startsWith(prefix)) {
						message = message.substr(prefix.length);
					}

					if (message.endsWith(suffix)) {
						message = message.substr(0, message.length - suffix.length);
					}

					return message;

				});


				if (lines.length > 0) {

					lines.forEach(message => {

						let chunk = message.trim();
						if (chunk.startsWith('(')) {
							chunk = chunk.substr(3).trim();
						}

						if (chunk.length > 0) {
							console.error(chunk);
						}

					});

				}

			}

		});

		handle.on('exit', function(code) {

			let info = '"' + args[1] + '" | "' + args[2] + '" | "' + args[3] + '"';
			let pid  = this.pid;

			if (code === 0) {
				console.info('SUCCESS (' + pid + ') (' + info + ')');
			} else if (code === 1) {
				console.error('FAILURE (' + pid + ') (' + info + ')');
			} else if (code === 2) {
				console.warn('FAILURE (' + pid + ') (' + info + ')');
			} else if (code === 3) {
				console.warn('SUCCESS (' + pid + ') (' + info + ') (SKIP)');
			}

			let index = _PROCESSES.indexOf(this.pid);
			if (index !== -1) {
				_PROCESSES.splice(index, 1);
			}

		});

		_PROCESSES.push(handle.pid);

	} catch (err) {
	}

};



if (process.argv.includes('--autocomplete')) {

	let tmp1   = process.argv.indexOf('--autocomplete');
	let words  = process.argv.slice(tmp1 + 1);
	let result = _print_autocomplete.apply(null, words);

	process.stdout.write(result.join(' '));

	process.exit(0);
	return;

}



const _SETTINGS = (function() {

	let args     = process.argv.slice(2).filter(val => val !== '');
	let settings = {
		action:  null,
		project: null,
		target:  null,
		debug:   false,
		sandbox: false
	};


	let action       = args.find(val => /^(fertilize|build|configure|package|publish)$/g.test(val));
	let project      = args.find(val => /^\/(libraries|projects)\/([A-Za-z0-9-_/]+)$/g.test(val));
	let target       = args.find(val => /^(([a-z-]+|\*))\/(([a-z]+)|\*)$/g.test(val));
	let debug_flag   = args.find(val => /--([debug]{5})/g.test(val));
	let sandbox_flag = args.find(val => /--([sandbox]{7})/g.test(val));


	if (debug_flag !== undefined) {
		settings.debug = true;
	}

	if (sandbox_flag !== undefined) {
		settings.sandbox = true;
	}


	if (action !== undefined && project !== undefined) {

		settings.action  = action;
		settings.project = project;


		let targets = [];

		try {

			let buffer = _fs.readFileSync(_ROOT + project + '/lychee.pkg', 'utf8');
			if (buffer !== '') {

				let data = null;
				try {
					data = JSON.parse(buffer);
				} catch (err) {
					data = null;
				}

				if (
					data instanceof Object
					&& data.build instanceof Object
					&& data.build.environments instanceof Object
				) {
					targets = Object.keys(data.build.environments);
				}

			}

		} catch (err) {
		}


		if (target !== undefined) {

			if (target.startsWith('*/')) {

				// XXX: Multi Mode (e.g. */main)
				_MULTI_MODE = true;

				let suffix = target.split('*').pop();
				let queue  = targets.filter(t => t.endsWith(suffix));
				if (queue.length > 0) {

					queue.forEach(t => {
						settings.target = t;
						_spawn(_settings_to_args(settings));
					});

				} else {
					settings.action  = null;
					settings.project = null;
				}

			} else if (target.endsWith('/*')) {

				// XXX: Multi Mode (e.g. node/*)
				_MULTI_MODE = true;

				let prefix = target.split('*').shift();
				let queue  = targets.filter(t => t.startsWith(prefix));
				if (queue.length > 0) {

					queue.forEach(t => {
						settings.target = t;
						_spawn(_settings_to_args(settings));
					});

				} else {
					settings.action  = null;
					settings.project = null;
				}

			} else {

				// XXX: Single Mode (e.g. node/main)

				let check = targets.includes(target);
				if (check === true) {

					settings.target = target;

				} else if (targets.length > 0) {

					// XXX: Single Mode (e.g. node/main) failed
					settings.action  = null;
					settings.project = null;

				} else {

					// XXX: Third-Party Single Mode (no lychee.pkg)
					// settings.action  = null;
					// settings.project = null;

				}

			}

		} else {

			// XXX: Multi Mode (all environments in lychee.pkg)
			_MULTI_MODE = true;

			targets.forEach(t => {
				settings.target = t;
				_spawn(_settings_to_args(settings));
			});

		}

	}


	return settings;

})();


if (_SETTINGS.debug === false) {

	let _old_error = console.error;
	let _old_info  = console.info;
	let _old_warn  = console.warn;

	console.error = function(str) {

		if (typeof str === 'string' && str.startsWith('lychee.Package')) {
			// XXX: Ignore console.error() call
		} else {
			_old_error.apply(console, arguments);
		}

	};

	console.info = function(str) {

		if (typeof str === 'string' && str.startsWith('lychee.Package')) {
			// XXX: Ignore console.info() call
		} else {
			_old_info.apply(console, arguments);
		}

	};

	console.warn = function(str) {

		if (typeof str === 'string' && (str.startsWith('Invalid') || str.startsWith('/') || str.startsWith('lychee.Package'))) {
			// XXX: Ignore console.warn() call
		} else {
			_old_warn.apply(console, arguments);
		}

	};

}


(function(settings) {

	// XXX: Multi Mode delegates to sub-processes
	if (_MULTI_MODE === true) {

		if (settings.action === null && settings.project === null) {

			let args = process.argv.slice(1);
			let info = '"' + args[1] + '" | "' + args[2] + '" | "' + args[3] + '"';

			console.warn('SUCCESS (' + process.pid + ') (' + info + ') (SKIP)');
			process.exit(3);

		}

		return;

	}



	/*
	 * IMPLEMENTATION
	 */

	let has_action  = settings.action !== null;
	let has_project = settings.project !== null;
	let has_target  = settings.target !== null;


	if (has_action && has_project && has_target) {

		_bootup({
			action:  settings.action,
			debug:   settings.debug === true,
			project: settings.project,
			sandbox: settings.sandbox === true,
			target:  settings.target
		});

	} else if (has_action && has_project) {

		_bootup({
			action:  settings.action,
			debug:   settings.debug === true,
			project: settings.project,
			sandbox: settings.sandbox === true
		});

	} else {

		console.error('PARAMETERS FAILURE');

		_print_help();

		process.exit(1);

	}

})(_SETTINGS);

