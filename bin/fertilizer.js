#!/usr/bin/lycheejs-helper env:node


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

	var targets = fs.readdirSync(root + '/libraries/lychee/build').sort();

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


	console.log('                                                              ');
	console.info('lycheeJS ' + lychee.VERSION + ' Fertilizer');
	console.log('                                                              ');
	console.log('Usage: lycheejs-fertilizer [Target] [Library/Project]         ');
	console.log('                                                              ');
	console.log('                                                              ');
	console.log('Available Fertilizers:                                        ');
	console.log('                                                              ');
	targets.forEach(function(target) {
		var diff = ('                                                          ').substr(target.length);
		console.log('    ' + target + diff);
	});
	console.log('                                                              ');
	console.log('Available Libraries:                                          ');
	console.log('                                                              ');
	libraries.forEach(function(library) {
		var diff = ('                                                          ').substr(library.length);
		console.log('    ' + library + diff);
	});
	console.log('                                                              ');
	console.log('Available Projects:                                           ');
	console.log('                                                              ');
	projects.forEach(function(project) {
		var diff = ('                                                          ').substr(project.length);
		console.log('    ' + project + diff);
	});
	console.log('                                                              ');
	console.log('Examples:                                                     ');
	console.log('                                                              ');
	console.log('    lycheejs-fertilizer html-nwjs/main /projects/boilerplate; ');
	console.log('    lycheejs-fertilizer node/main /projects/boilerplate;      ');
	console.log('                                                              ');

};



var _settings = (function() {

	var settings = {
		project:     null,
		identifier:  null,
		environment: null
	};


	var raw_arg0 = process.argv[2] || '';
	var raw_arg1 = process.argv[3] || '';


	var pkg_path = root + raw_arg1 + '/lychee.pkg';
	if (fs.existsSync(pkg_path) === true) {

		settings.project = raw_arg1;


		var json = null;

		try {
			json = JSON.parse(fs.readFileSync(pkg_path, 'utf8'));
		} catch(e) {
			json = null;
		}


		if (json !== null) {

			if (json.build instanceof Object && json.build.environments instanceof Object) {

				if (json.build.environments[raw_arg0] instanceof Object) {
					settings.identifier  = raw_arg0;
					settings.environment = json.build.environments[raw_arg0];
				}

			}

		}

	}


	return settings;

})();

var _bootup = function(settings) {

	console.info('BOOTUP (' + process.pid + ')');

	var environment = new lychee.Environment({
		id:      'fertilizer',
		debug:   false,
		sandbox: false,
		build:   'fertilizer.Main',
		timeout: 1000,
		packages: [
			new lychee.Package('lychee',     '/libraries/lychee/lychee.pkg'),
			new lychee.Package('fertilizer', '/libraries/fertilizer/lychee.pkg')
		],
		tags:     {
			platform: [ 'node' ]
		}
	});


	lychee.setEnvironment(environment);


	environment.init(function(sandbox) {

		if (sandbox !== null) {

			var lychee     = sandbox.lychee;
			var fertilizer = sandbox.fertilizer;


			// Show less debug messages
			lychee.debug = true;


			// This allows using #MAIN in JSON files
			sandbox.MAIN = new fertilizer.Main(settings);

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

				console.warn('fertilizer: [ESC] pressed, exiting ...');
				sandbox.MAIN.destroy();

			}, this);

		} else {

			console.error('BOOTUP FAILURE');

			process.exit(1);

		}

	});

};



(function(project, identifier, settings) {

	/*
	 * IMPLEMENTATION
	 */

	var has_project    = project !== null;
	var has_identifier = identifier !== null;
	var has_settings   = settings !== null;


	if (has_project && has_identifier && has_settings) {

		_bootup({
			project:    project,
			identifier: identifier,
			settings:   settings
		});

	} else {

		console.error('PARAMETERS FAILURE');

		_print_help();

		process.exit(1);

	}

})(_settings.project, _settings.identifier, _settings.environment);

