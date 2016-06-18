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


	console.log('                                                    ');
	console.info('lychee.js ' + lychee.VERSION + ' Strainer');
	console.log('                                                    ');
	console.log('Usage: lycheejs-strainer [Action] [Library/Project] ');
	console.log('                                                    ');
	console.log('                                                    ');
	console.log('Available Actions:                                  ');
	console.log('                                                    ');
	console.log('    stash                                           ');
	console.log('                                                    ');
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
	console.log('                                                    ');
	console.log('Examples:                                           ');
	console.log('                                                    ');
	console.log('    lycheejs-strainer stash /libraries/lychee;      ');
	console.log('    lycheejs-strainer stash /projects/boilerplate;  ');
	console.log('                                                    ');

};



var _settings = (function() {

	var settings = {
		action:  null,
		project: null
	};


	var raw_arg0 = process.argv[2] || '';
	var raw_arg1 = process.argv[3] || '';


	var pkg_path = root + raw_arg1 + '/lychee.pkg';
	if (fs.existsSync(pkg_path) === true) {
		settings.project = raw_arg1;
	}


	// stash /projects/boilerplate
	if (raw_arg0 === 'stash') {

		settings.action = 'stash';

	}


	return settings;

})();

var _bootup = function(settings) {

	console.info('BOOTUP (' + process.pid + ')');

	var environment = new lychee.Environment({
		id:       'strainer',
		debug:    false,
		sandbox:  true,
		build:    'strainer.Main',
		timeout:  3000,
		packages: [
			new lychee.Package('lychee',     '/libraries/lychee/lychee.pkg'),
			new lychee.Package('fertilizer', '/libraries/fertilizer/lychee.pkg'),
			new lychee.Package('strainer',   '/libraries/strainer/lychee.pkg')
		],
		tags:     {
			platform: [ 'node' ]
		}
	});


	lychee.setEnvironment(environment);


	environment.init(function(sandbox) {

		if (sandbox !== null) {

			var lychee   = sandbox.lychee;
			var strainer = sandbox.strainer;


			// Show less debug messages
			lychee.debug = true;


			// This allows using #MAIN in JSON files
			sandbox.MAIN = new strainer.Main(settings);

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

				console.warn('strainer: [ESC] pressed, exiting ...');
				sandbox.MAIN.destroy();

			}, this);

		} else {

			console.error('BOOTUP FAILURE');

			process.exit(1);

		}

	});

};



(function(action, project) {

	/*
	 * IMPLEMENTATION
	 */

	var has_action  = action !== null;
	var has_project = project !== null;


	if (has_action && has_project) {

		_bootup({
			action:  action,
			project: project
		});

	} else {

		console.error('PARAMETERS FAILURE');

		_print_help();

		process.exit(1);

	}

})(_settings.action, _settings.project);

