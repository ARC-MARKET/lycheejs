#!/usr/local/bin/lycheejs-helper env:node


var root = require('path').resolve(__dirname, '../');
var fs   = require('fs');
var path = require('path');


if (fs.existsSync(root + '/libraries/lychee/build/node/core.js') === false) {
	require(root + '/bin/configure.js');
}


var lychee = require(root + '/libraries/lychee/build/node/core.js')(root);



/*
 * USAGE
 */

var _print_help = function() {

	var libraries = fs.readdirSync(root + '/libraries').sort().filter(function(value) {
		return fs.existsSync(root + '/libraries/' + value + '/lychee.pkg');
	}).map(function(value) {
		return '/libraries/' + value;
	});

	var projects = fs.readdirSync(root + '/projects').sort().filter(function(value) {
		return fs.existsSync(root + '/projects/' + value + '/lychee.pkg');
	}).map(function(value) {
		return '/projects/' + value;
	});


	console.log('                                                   ');
	console.info('lychee.js ' + lychee.VERSION + ' Breeder');
	console.log('                                                   ');
	console.log('Usage: lycheejs-breeder [Action] [Library/Project] ');
	console.log('                                                   ');
	console.log('                                                   ');
	console.log('Available Actions:                                 ');
	console.log('                                                   ');
	console.log('    init, pull, push                               ');
	console.log('                                                   ');
	console.log('Available Libraries:                                ');
	console.log('                                                    ');
	libraries.forEach(function(library) {
		var diff = ('                                                ').substr(library.length);
		console.log('    ' + library + diff);
	});
	console.log('                                                    ');
	console.log('Available Projects:                                 ');
	console.log('                                                    ');
	projects.forEach(function(project) {
		var diff = ('                                                ').substr(project.length);
		console.log('    ' + project + diff);
	});
	console.log('                                                   ');
	console.log('Examples:                                          ');
	console.log('                                                   ');
	console.log('    cd /projects/my-project;                       ');
	console.log('                                                   ');
	console.log('    lycheejs-breeder init;                         ');
	console.log('    lycheejs-breeder pull /libraries/harvester;    ');
	console.log('    lycheejs-breeder push;                         ');
	console.log('                                                   ');

};



var _settings = (function() {

	var args     = process.argv.slice(2).filter(val => val !== '');
	var settings = {
		action:   null,
		project:  null,
		library:  null
	};


	var action       = args.find(val => /(init|pull|push)/g.test(val));
	var library      = args.find(val => /^\/(libraries|projects)\/([A-Za-z0-9-_\/]+)$/g.test(val));
	var project      = args.find(val => /--project=\/(libraries|projects)\/([A-Za-z0-9-_\/]+)/g.test(val));
	var debug_flag   = args.find(val => /--([debug]{5})/g.test(val));
	var sandbox_flag = args.find(val => /--([sandbox]{7})/g.test(val));


	if (project !== undefined) {

		var tmp = project.substr(10);
		if (tmp.indexOf('.') === -1) {

			try {

				var stat1 = fs.lstatSync(root + tmp);
				if (stat1.isDirectory()) {
					settings.project = tmp;
				}

			} catch(e) {

				settings.project = null;

			}

		}

	}


	if (action === 'pull') {

		if (library !== undefined) {

			settings.action = action;


			try {
				var stat1 = fs.lstatSync(root + library);
				var stat2 = fs.lstatSync(root + library + '/lychee.pkg');
				if (stat1.isDirectory() && stat2.isFile()) {
					settings.library = library;
				}

			} catch(e) {

				settings.library = null;

			}

		}

	} else if (action !== undefined) {

		settings.action = action;

	}


	return settings;

})();

var _bootup = function(settings) {

	console.info('BOOTUP (' + process.pid + ')');

	var environment = new lychee.Environment({
		id:      'breeder',
		debug:   false,
		sandbox: false,
		build:   'breeder.Main',
		timeout: 1000,
		packages: [
			new lychee.Package('lychee',     '/libraries/lychee/lychee.pkg'),
			new lychee.Package('fertilizer', '/libraries/fertilizer/lychee.pkg'),
			new lychee.Package('breeder',    '/libraries/breeder/lychee.pkg')
		],
		tags:     {
			platform: [ 'node' ]
		}
	});


	lychee.setEnvironment(environment);


	environment.init(function(sandbox) {

		if (sandbox !== null) {

			var lychee     = sandbox.lychee;
			var breeder    = sandbox.breeder;
			var fertilizer = sandbox.fertilizer;


			// Show less debug messages
			lychee.debug = true;


			// This allows using #MAIN in JSON files
			sandbox.MAIN = new breeder.Main(settings);

			sandbox.MAIN.bind('destroy', function() {
				process.exit(0);
			});

			sandbox.MAIN.init();


			process.on('SIGHUP',  function() { sandbox.MAIN.destroy(); this.exit(1); });
			process.on('SIGINT',  function() { sandbox.MAIN.destroy(); this.exit(1); });
			process.on('SIGQUIT', function() { sandbox.MAIN.destroy(); this.exit(1); });
			process.on('SIGABRT', function() { sandbox.MAIN.destroy(); this.exit(1); });
			process.on('SIGTERM', function() { sandbox.MAIN.destroy(); this.exit(1); });
			process.on('error',   function() { sandbox.MAIN.destroy(); this.exit(1); });
			process.on('exit',    function() {});


			new lychee.Input({
				key:         true,
				keymodifier: true
			}).bind('escape', function() {

				console.warn('breeder: [ESC] pressed, exiting ...');
				sandbox.MAIN.destroy();

			}, this);

		} else {

			console.error('BOOTUP FAILURE');

			process.exit(1);

		}

	});

};



(function(settings) {

	/*
	 * IMPLEMENTATION
	 */

	var action      = settings.action;
	var has_project = settings.project !== null;
	var has_library = settings.library !== null;


	if (action === 'init' && has_project) {

		_bootup({
			action:  'init',
			project: settings.project
		});

	} else if (action === 'pull' && has_project && has_library) {

		_bootup({
			action:  'pull',
			project: settings.project,
			library: settings.library
		});

	} else if (action === 'push' && has_project) {

		_bootup({
			action:  'push',
			project: settings.project
		});

	} else {

		console.error('PARAMETERS FAILURE');

		_print_help();

		process.exit(1);

	}

})(_settings);

