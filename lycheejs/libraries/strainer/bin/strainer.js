#!/usr/local/bin/lycheejs-helper env:node


const _fs    = require('fs');
const _path  = require('path');
const _CWD   = process.env.STRAINER_CWD  || process.cwd();
const _ROOT  = process.env.LYCHEEJS_ROOT || '/opt/lycheejs';
const lychee = require(_ROOT + '/libraries/crux/build/node/dist.js')(_ROOT);

if (process.argv.includes('--autocomplete')) {
	console.log   = function() {};
	console.info  = function() {};
	console.warn  = function() {};
	console.error = function() {};
}



/*
 * USAGE
 */

const _print_autocomplete = function(action, project, flag) {

	let actions   = [ 'check', 'simulate', 'transcribe' ];
	let flags     = [ '--debug' ];
	let libraries = _fs.readdirSync(_ROOT + '/libraries')
		.sort()
		.map(val => '/libraries/' + val)
		.filter(val => _fs.existsSync(_ROOT + val + '/lychee.pkg'));
	let projects  = _fs.readdirSync(_ROOT + '/projects')
		.sort()
		.map(val => '/projects/' + val)
		.filter(val => _fs.existsSync(_ROOT + val + '/lychee.pkg'));


	let suggestions = [];
	let has_action  = actions.find(a => a === action);
	let has_project = libraries.find(l => l === project) || projects.find(p => p === project);
	let has_flag    = flags.find(f => f === flag);

	if (has_action && has_project && has_flag) {
		// Nothing to suggest
	} else if (has_action && has_project && flag) {
		suggestions = flags.filter(f => f.startsWith(flag));
	} else if (has_action && has_project) {
		suggestions = flags;
	} else if (has_action && project) {
		suggestions.push.apply(suggestions, libraries.filter(l => l.startsWith(project)));
		suggestions.push.apply(suggestions, projects.filter(p => p.startsWith(project)));
	} else if (has_action) {
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
	console.info('lychee.js ' + lychee.VERSION + ' Strainer');
	console.log('');
	console.log('Detected lychee.js Installation: "' + lychee.ROOT.lychee + '"');
	console.log('');
	console.log('Usage: lycheejs-strainer [Action] [Library/Project] [Flag]');
	console.log('');
	console.log('');
	console.log('Available Actions:');
	console.log('');
	console.log('    check      Check a Project or Library and generate API Knowledge.       ');
	console.log('    simulate   Simulate a Project or Library.                               ');
	console.log('    transcribe Transcribe a Project or Library from API Knowledge into Code.');
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
	console.log('    --debug    Enable debug messages.');
	console.log('');
	console.log('Examples:');
	console.log('');
	console.log('    lycheejs-strainer check /libraries/lychee;                ');
	console.log('    lycheejs-strainer simulate /libraries/lychee;             ');
	console.log('');
	console.log('    lycheejs-strainer transcribe /projects/pong /projects/tmp;');
	console.log('    lycheejs-strainer transcribe /projects/tmp /projects/pong;');
	console.log('');

};

const _bootup = function(settings) {

	console.info('BOOTUP (' + process.pid + ')');


	lychee.ROOT.project = lychee.ROOT.lychee + '/libraries/strainer';

	lychee.init(null);
	lychee.pkg('build', 'node/main', environment => {

		lychee.init(environment, {
			debug:   settings.debug === true,
			sandbox: settings.debug === true ? false : true
		}, sandbox => {

			if (sandbox !== null) {

				let lychee   = sandbox.lychee;
				let strainer = sandbox.strainer;


				// Show more debug messages
				lychee.debug = settings.debug === true;


				// This allows using #MAIN in JSON files
				sandbox.MAIN = new strainer.Main(settings);
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
		cwd:     _CWD,
		action:  null,
		library: null,
		project: null,
		debug:   false
	};


	let action     = args.find(val => /^(check|simulate|transcribe)$/g.test(val));
	let project    = args.find(val => /^\/(libraries|projects)\/([A-Za-z0-9-_/]+)$/g.test(val));
	let debug_flag = args.find(val => /--([debug]{5})/g.test(val));


	if (action === 'check' || action === 'simulate') {

		settings.action = action;


		let path = args.find(val => val.includes('/'));

		if (project !== undefined) {

			try {

				let stat1 = _fs.lstatSync(_ROOT + project);
				let stat2 = _fs.lstatSync(_ROOT + project + '/lychee.pkg');

				if (stat1.isSymbolicLink()) {

					let tmp   = _fs.realpathSync(_ROOT + project);
					let stat3 = _fs.lstatSync(tmp);
					let stat4 = _fs.lstatSync(tmp + '/lychee.pkg');

					if (stat3.isDirectory() && stat4.isFile()) {
						settings.project = project;
					}

				} else if (stat1.isDirectory()) {

					if (stat2.isFile()) {
						settings.project = project;
					}

				}

			} catch (err) {

				settings.project = null;

			}

		} else if (path !== undefined) {

			let project = path;

			try {

				let stat1 = _fs.lstatSync(project);
				let stat2 = _fs.lstatSync(project + '/lychee.pkg');

				if (stat1.isSymbolicLink()) {

					let tmp   = _fs.realpathSync(_ROOT + project);
					let stat3 = _fs.lstatSync(tmp);
					let stat4 = _fs.lstatSync(tmp + '/lychee.pkg');

					if (stat3.isDirectory() && stat4.isFile()) {
						settings.project = project;
					}

				} else if (stat1.isDirectory()) {

					if (stat2.isFile()) {
						settings.project = project;
					}

				}

			} catch (err) {

				settings.project = null;

			}

		}

	} else if (action === 'transcribe') {

		settings.action = action;


		let paths = args.filter(val => /^\/(libraries|projects)\/([A-Za-z0-9-_/]+)$/g.test(val));
		if (paths.length === 2) {

			let library = paths[0];
			let project = paths[1];

			if (library !== undefined) {

				try {

					let stat1 = _fs.lstatSync(_ROOT + library);
					let stat2 = _fs.lstatSync(_ROOT + library + '/lychee.pkg');

					if (stat1.isSymbolicLink()) {

						let tmp   = _fs.realpathSync(_ROOT + library);
						let stat3 = _fs.lstatSync(tmp);
						let stat4 = _fs.lstatSync(tmp + '/lychee.pkg');

						if (stat3.isDirectory() && stat4.isFile()) {
							settings.library = library;
						}

					} else if (stat1.isDirectory()) {

						if (stat2.isFile()) {
							settings.library = library;
						}

					}

				} catch (err) {

					settings.library = null;

				}

			}

			if (project !== undefined) {

				try {

					let stat1 = _fs.lstatSync(_ROOT + project);
					let stat2 = _fs.lstatSync(_ROOT + project + '/lychee.pkg');

					if (stat1.isDirectory() === false && stat2.isFile() === false) {
						settings.project = project;
					}

				} catch (err) {

					if (err.code === 'ENOENT') {
						settings.project = project;
					} else {
						settings.project = null;
					}

				}

			}

		}

	}


	if (debug_flag !== undefined) {
		settings.debug = true;
	}


	return settings;

})();



(function(settings) {

	/*
	 * IMPLEMENTATION
	 */

	let action      = settings.action;
	let has_project = settings.project !== null;
	let has_library = settings.library !== null;


	if (action === 'check' && has_project) {

		_bootup({
			cwd:     settings.cwd,
			action:  settings.action,
			debug:   settings.debug === true,
			project: settings.project
		});

	} else if (action === 'simulate' && has_project) {

		_bootup({
			cwd:     settings.cwd,
			action:  settings.action,
			debug:   settings.debug === true,
			project: settings.project
		});

	} else if (action === 'transcribe' && has_project && has_library) {

		_bootup({
			cwd:     settings.cwd,
			action:  settings.action,
			debug:   settings.debug === true,
			library: settings.library,
			project: settings.project
		});

	} else {

		console.error('PARAMETERS FAILURE');

		_print_help();

		process.exit(1);

	}

})(_SETTINGS);

