#!/usr/local/bin/lycheejs-helper env:node


const _fs   = require('fs');
const _path = require('path');
const _CWD  = process.env.STRAINER_CWD  || process.cwd();
const _ROOT = process.env.LYCHEEJS_ROOT || '/opt/lycheejs';



/*
 * USAGE
 */

const _print_autocomplete = function(path) {

	path = typeof path === 'string' ? path : '';


	if (path.startsWith(_ROOT)) {
		path = path.substr(_ROOT.length);
	}


	let libraries = _fs.readdirSync(_ROOT + '/libraries')
		.sort()
		.map(val => '/libraries/' + val)
		.filter(val => _fs.existsSync(_ROOT + val + '/lychee.pkg'));
	let projects  = _fs.readdirSync(_ROOT + '/projects')
		.sort()
		.map(val => '/projects/' + val)
		.filter(val => _fs.existsSync(_ROOT + val + '/lychee.pkg'));


	let suggestions = [];
	let has_project = libraries.find(l => {
		if (path.length > l.length) return path.startsWith(l);
		return path === l;
	}) || projects.find(p => {
		if (path.length > p.length) return path.startsWith(p);
		return path === p;
	});


	if (has_project) {

		if (path.endsWith('/')) {
			path = path.substr(0, path.length - 1);
		}

		let tmp = path.split('/');
		if (tmp.length > 3) {

			let dir  = tmp.slice(0, -1).join('/');
			let file = tmp.slice(-1);

			let found = false;

			try {

				let stat = _fs.lstatSync(_ROOT + dir + '/' + file);
				if (stat.isDirectory()) {

					suggestions = _fs.readdirSync(_ROOT + dir + '/' + file)
						.filter(f => {
							if (f.includes('.')) return f.endsWith('.js');
							return true;
						})
						.map(f => dir + '/' + file + '/' + f);

					found = true;

				} else if (stat.isFile()) {

					suggestions = [ dir + '/' + file ];
					found = true;

				}

			} catch (err) {
			}


			if (found === false) {

				try {

					let stat = _fs.lstatSync(_ROOT + dir);
					if (stat.isDirectory()) {

						suggestions = _fs.readdirSync(_ROOT + dir)
							.filter(f => {
								if (f.includes('.')) return f.endsWith('.js');
								return true;
							})
							.filter(f => f.startsWith(file))
							.map(f => dir + '/' + f);

						found = true;

					}

				} catch (err) {
				}

			}

		}

	} else if (path !== '') {

		if (path.startsWith('/libraries/')) {
			suggestions = libraries.filter(l => l.startsWith(path));
		} else if (path.startsWith('/projects/')) {
			suggestions = projects.filter(p => p.startsWith(path));
		} else {
			suggestions.push.apply(suggestions, libraries.filter(l => l.startsWith(path)));
			suggestions.push.apply(suggestions, projects.filter(p => p.startsWith(path)));
		}

	} else {

		suggestions.push.apply(suggestions, libraries);
		suggestions.push.apply(suggestions, projects);

	}

	return suggestions.sort();

};

const _print_help = function() {

	console.log('                                                                  ');
	console.info('lychee.js ' + lychee.VERSION + ' Strainer (Fixer)');
	console.log('                                                                  ');
	console.log('Usage: lycheejs-strainer-fixer [File] [Flag]                      ');
	console.log('                                                                  ');
	console.log('                                                                  ');
	console.log('Available Flags:                                                  ');
	console.log('                                                                  ');
	console.log('    --debug    Enable debug messages.                             ');
	console.log('                                                                  ');
	console.log('Examples:                                                         ');
	console.log('                                                                  ');
	console.log('    # cwd has to be /opt/lycheejs                                 ');
	console.log('    lycheejs-strainer-fixer /projects/boilerplate/source/Main.js; ');
	console.log('                                                                  ');

};

const _bootup = function(settings) {

	// XXX: Quickfix Mode doesn't allow
	// console log/info/warn or pretty
	// color codes, so strip them out.

	if (settings.debug === false) {

		console.log   = function() {};
		console.info  = function() {};
		console.warn  = function() {};
		console.error = function() {

			let al   = arguments.length;
			let args = [];
			for (let a = 0; a < al; a++) {
				args.push(arguments[a]);
			}

			process.stdout.write(args.join(' ') + '\n');

		};

	}


	lychee.ROOT.project = lychee.ROOT.lychee + '/libraries/strainer';

	lychee.init(null);
	lychee.pkg('build', 'node/fixer', environment => {

		lychee.init(environment, {
			debug:   false,
			sandbox: true
		}, sandbox => {

			if (sandbox !== null) {

				let lychee   = sandbox.lychee;
				let strainer = sandbox.strainer;


				// Show less debug messages
				lychee.debug = false;


				// This allows using #MAIN in JSON files
				sandbox.MAIN = new strainer.Fixer(settings);
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



// XXX: Quickfix Mode doesn't need console.info() calls.

const lychee = (function() {

	let _old_write = process.stdout.write;
	process.stdout.write = function() {};

	let lychee = require(_ROOT + '/libraries/crux/build/node/dist.js')(_ROOT);
	process.stdout.write = _old_write;

	return lychee;

})();



const _SETTINGS = (function() {

	let args     = process.argv.slice(2).filter(val => val !== '');
	let settings = {
		cwd:     _CWD,
		file:    null,
		project: null,
		debug:   false
	};


	let debug_flag = args.find(val => /--([debug]{5})/g.test(val));


	let file = args[0];
	if (file !== undefined) {

		if (file.startsWith('./')) {
			file = _CWD + '/' + file.substr(2);
		} else if (file.startsWith('/libraries')) {
			file = _CWD + file;
		} else if (file.startsWith('/projects')) {
			file = _CWD + file;
		} else if (file.startsWith('/') === false) {
			file = _CWD + '/' + file;
		}

		try {

			let stat = _fs.lstatSync(file);
			if (stat.isFile()) {
				settings.file = file;
			}

		} catch (err) {

			settings.file = null;

		}


		if (settings.file !== null) {

			let path   = settings.file.split('/');
			let check1 = path.findIndex(val => /^(projects|libraries)$/g.test(val));
			let check2 = path.findIndex(val => val === 'source');

			// XXX: Allow /tmp/lycheejs usage
			if (check1 !== -1) {

				let project = '/' + path.slice(3, 5).join('/');

				try {

					let stat1 = _fs.lstatSync(_ROOT + project);
					let stat2 = _fs.lstatSync(_ROOT + project + '/lychee.pkg');

					if (stat1.isDirectory() || stat1.isSymbolicLink()) {

						if (stat2.isFile()) {
							settings.project = project;
						}

					}

				} catch (err) {

					settings.project = null;

				}


				if (settings.project !== null) {

					let index = settings.file.indexOf(settings.project);
					if (index !== -1) {
						settings.file = settings.file.substr(index + settings.project.length + 1);
					}

				}

			// XXX: Allow /home/whatever/my-project usage
			} else if (check2 !== -1) {

				let project = path.slice(0, check2).join('/');

				try {

					let stat1 = _fs.lstatSync(project);
					let stat2 = _fs.lstatSync(project + '/lychee.pkg');

					if (stat1.isDirectory() || stat1.isSymbolicLink()) {

						if (stat2.isFile()) {
							settings.project = project;
						}

					}

				} catch (err) {

					settings.project = null;

				}


				if (settings.project !== null) {

					let index = settings.file.indexOf(settings.project);
					if (index !== -1) {
						settings.file = settings.file.substr(index + settings.project.length + 1);
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

	let has_file    = settings.file !== null;
	let has_project = settings.project !== null;


	if (has_file && has_project) {

		_bootup({
			cwd:     settings.cwd,
			debug:   settings.debug === true,
			file:    settings.file,
			project: settings.project
		});

	} else {

		console.error('PARAMETERS FAILURE');

		_print_help();

		process.exit(1);

	}

})(_SETTINGS);

