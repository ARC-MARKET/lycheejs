#!/usr/local/bin/lycheejs-helper env:node


const _fs    = require('fs');
const _path  = require('path');
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

	let actions   = [ 'init', 'fork', 'pull', 'push' ];
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
	} else if (has_action !== 'init' && project) {
		suggestions.push.apply(suggestions, libraries.filter(l => l.startsWith(project)));
		suggestions.push.apply(suggestions, projects.filter(p => p.startsWith(project)));
	} else if (has_action && action === 'init') {
		// Nothing to suggest
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
		.filter(val => _fs.existsSync(_ROOT + '/libraries/' + val + '/lychee.pkg'))
		.map(val => '/libraries/' + val);
	let projects  = _fs.readdirSync(_ROOT + '/projects')
		.sort()
		.filter(val => _fs.existsSync(_ROOT + '/projects/' + val + '/lychee.pkg'))
		.map(val => '/projects/' + val);


	console.log('');
	console.info('lychee.js ' + lychee.VERSION + ' Breeder');
	console.log('');
	console.log('Detected lychee.js Installation: "' + lychee.ROOT.lychee + '"');
	console.log('');
	console.log('Usage: lycheejs-breeder [Action] [Library/Project] [Flag]');
	console.log('');
	console.log('');
	console.log('Available Actions:');
	console.log('');
	console.log('    init       Initialize a Project or Definition.  ');
	console.log('    fork       Fork a Project or Library.           ');
	console.log('    pull       Pull a Library into "./libraries".   ');
	console.log('    push       Push a Project or Library to the DHG.');
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
	console.log('    cd /projects/my-project;                           ');
	console.log('');
	console.log('    # Use either init or fork to start                 ');
	console.log('    lycheejs-breeder init;                             ');
	console.log('    lycheejs-breeder fork /projects/boilerplate;       ');
	console.log('');
	console.log('    # Create lychee.Definition and lychee.Specification');
	console.log('    lycheejs-breeder init app.net.service.Example;     ');
	console.log('');
	console.log('    lycheejs-breeder pull /libraries/harvester;        ');
	console.log('    lycheejs-breeder push;                             ');
	console.log('');

};

const _bootup = function(settings) {

	console.info('BOOTUP (' + process.pid + ')');


	lychee.ROOT.project = lychee.ROOT.lychee + '/libraries/breeder';

	lychee.init(null);
	lychee.pkg('build', 'node/main', environment => {

		lychee.init(environment, {
			debug:   settings.debug === true,
			sandbox: settings.debug === true ? false : true
		}, sandbox => {

			if (sandbox !== null) {

				let lychee  = sandbox.lychee;
				let breeder = sandbox.breeder;


				// Show less debug messages
				lychee.debug = true;


				// This allows using #MAIN in JSON files
				sandbox.MAIN = new breeder.Main(settings);
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
		action:     null,
		identifier: null,
		library:    null,
		project:    null,
		debug:      false
	};


	let action     = args.find(val => /^(init|fork|pull|push)$/g.test(val));
	let identifier = args.find(val => val.includes('.') && /^([A-Za-z.]+)$/g.test(val));
	let library    = args.find(val => /^\/(libraries|projects)\/([A-Za-z0-9-_/]+)$/g.test(val));
	let project    = args.find(val => /--project=\/(libraries|projects)\/([A-Za-z0-9-_/]+)/g.test(val));
	let debug_flag = args.find(val => /--([debug]{5})/g.test(val));


	if (project !== undefined) {

		let tmp = project.substr(10);
		if (tmp.indexOf('.') === -1) {

			try {

				let stat1 = _fs.lstatSync(_ROOT + tmp);
				if (stat1.isSymbolicLink()) {

					let tmp2  = _fs.realpathSync(_ROOT + tmp);
					let stat2 = _fs.lstatSync(tmp2);
					if (stat2.isDirectory()) {
						settings.project = tmp;
					}

				} else if (stat1.isDirectory()) {
					settings.project = tmp;
				}

			} catch (err) {

				settings.project = null;

			}

		}

	}

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


	if (action === 'init') {

		settings.action = action;

		if (identifier !== undefined) {
			settings.identifier = identifier;
		}

	} else if (action === 'fork') {

		settings.action = action;

	} else if (action === 'pull') {

		settings.action = action;

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

	let action         = settings.action;
	let has_identifier = settings.identifier !== null;
	let has_project    = settings.project !== null;
	let has_library    = settings.library !== null;


	if (action === 'init' && has_project && has_identifier) {

		_bootup({
			action:     'init',
			debug:      settings.debug === true,
			identifier: settings.identifier,
			project:    settings.project
		});

	} else if (action === 'init' && has_project) {

		_bootup({
			action:  'init',
			debug:   settings.debug === true,
			project: settings.project
		});

	} else if (action === 'fork' && has_project && has_library) {

		_bootup({
			action:  'fork',
			debug:   settings.debug === true,
			project: settings.project,
			library: settings.library
		});

	} else if (action === 'pull' && has_project && has_library) {

		_bootup({
			action:  'pull',
			debug:   settings.debug === true,
			project: settings.project,
			library: settings.library
		});

	} else if (action === 'push' && has_project) {

		_bootup({
			action:  'push',
			debug:   settings.debug === true,
			project: settings.project
		});

	} else {

		console.error('PARAMETERS FAILURE');

		_print_help();

		process.exit(1);

	}

})(_SETTINGS);

