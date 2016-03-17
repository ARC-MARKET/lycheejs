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

	var profiles = fs.readdirSync(root + '/bin/harvester').map(function(value) {
		return '' + value.substr(0, value.indexOf('.json')) + '';
	});


	console.log('                                                            ');
	console.info('lycheeJS ' + lychee.VERSION + ' Harvester');
	console.log('                                                            ');
	console.log('Usage: lycheejs-harvester [Action] [Profile] [Flag]         ');
	console.log('                                                            ');
	console.log('                                                            ');
	console.log('Available Actions:                                          ');
	console.log('                                                            ');
	console.log('   start, status, restart, stop                             ');
	console.log('                                                            ');
	console.log('Available Profiles:                                         ');
	console.log('                                                            ');
	profiles.forEach(function(profile) {
		var diff = ('                                                        ').substr(profile.length);
		console.log('    ' + profile + diff);
	});
	console.log('                                                            ');
	console.log('Available Flags:                                            ');
	console.log('                                                            ');
	console.log('   --no-integration                                         ');
	console.log('                                                            ');
	console.log('Examples:                                                   ');
	console.log('                                                            ');
	console.log('    lycheejs-harvester start development;                   ');
	console.log('    lycheejs-harvester restart development --no-integration;');
	console.log('                                                            ');

};



var _settings = (function() {

	var settings = {
		action:      null,
		profile:     null,
		integration: true
	};


	var raw_arg0 = process.argv[2] || '';
	var raw_arg1 = process.argv[3] || '';
	var raw_arg2 = process.argv[4] || '';


	if (raw_arg0 === 'start') {

		settings.action = 'start';


		try {

			var stat1 = fs.lstatSync(root + '/bin/harvester/' + raw_arg1 + '.json');
			if (stat1.isFile()) {

				var json = null;
				try {
					json = JSON.parse(fs.readFileSync(root + '/bin/harvester/' + raw_arg1 + '.json', 'utf8'));
				} catch(e) {
				}

				if (json !== null) {
					settings.profile = json;
				}

			}

		} catch(e) {
		}


	} else if (raw_arg0 === 'stop') {

		settings.action = 'stop';

	}


	if (raw_arg2 === '--no-integration') {
		settings.integration = false;
	}


	return settings;

})();

var _clear_pid = function() {

	try {

		fs.unlinkSync(root + '/bin/harvester.pid');
		return true;

	} catch(e) {

		return false;

	}

};

var _read_pid = function() {

	var pid = null;

	try {

		pid = fs.readFileSync(root + '/bin/harvester.pid', 'utf8');

		if (!isNaN(parseInt(pid, 10))) {
			pid = parseInt(pid, 10);
		}

	} catch(e) {
		pid = null;
	}

	return pid;

};

var _write_pid = function() {

	try {

		fs.writeFileSync(root + '/bin/harvester.pid', process.pid);
		return true;

	} catch(e) {

		return false;

	}

};

var _bootup = function(settings) {

	console.info('BOOTUP (' + process.pid + ')');

	var environment = new lychee.Environment({
		id:      'harvester',
		debug:   false,
		sandbox: false,
		build:   'harvester.Main',
		timeout: 10000, // for really slow hosts
		packages: [
			new lychee.Package('lychee',    '/libraries/lychee/lychee.pkg'),
			new lychee.Package('harvester', '/libraries/harvester/lychee.pkg')
		],
		tags:     {
			platform: [ 'node' ]
		}
	});


	lychee.setEnvironment(environment);


	environment.init(function(sandbox) {

		if (sandbox !== null) {

			var lychee    = sandbox.lychee;
			var harvester = sandbox.harvester;


			// Show more debug messages
			lychee.debug = true;


			// This allows using #MAIN in JSON files
			sandbox.MAIN = new harvester.Main(settings);
			sandbox.MAIN.init();
			sandbox.MAIN.bind('destroy', function() {
				process.exit(0);
			});
			_write_pid();


			process.on('SIGHUP',  function() { sandbox.MAIN.destroy(); _clear_pid(); this.exit(1); });
			process.on('SIGINT',  function() { sandbox.MAIN.destroy(); _clear_pid(); this.exit(1); });
			process.on('SIGQUIT', function() { sandbox.MAIN.destroy(); _clear_pid(); this.exit(1); });
			process.on('SIGABRT', function() { sandbox.MAIN.destroy(); _clear_pid(); this.exit(1); });
			process.on('SIGTERM', function() { sandbox.MAIN.destroy(); _clear_pid(); this.exit(1); });
			process.on('error',   function() { sandbox.MAIN.destroy(); _clear_pid(); this.exit(1); });
			process.on('exit',    function() {});


			new lychee.Input({
				key:         true,
				keymodifier: true
			}).bind('escape', function() {

				console.warn('harvester: [ESC] pressed, exiting ...');

				sandbox.MAIN.destroy();
				_clear_pid();

			}, this);

		} else {

			console.error('BOOTUP FAILURE');

			_clear_pid();

			process.exit(1);

		}

	});

};



(function(settings) {

	/*
	 * IMPLEMENTATION
	 */

	var action      = settings.action;
	var has_action  = settings.action !== null;
	var has_profile = settings.profile !== null;


	if (action === 'start' && has_profile) {

		settings.profile.integration = settings.integration === true;

		_bootup(settings.profile);

	} else if (action === 'stop') {

		var pid = _read_pid();
		if (pid !== null) {

			console.info('SHUTDOWN (' + pid + ')');

			var killed = false;

			try {

				process.kill(pid, 'SIGTERM');
				killed = true;

			} catch(err) {

				if (err.code === 'ESRCH') {
					killed = true;
				}

			}

			if (killed === true) {

				_clear_pid();

			} else {

				console.info('RIGHTS FAILURE (OR PROCESS ' + pid + ' ALEADY DEAD?)');

			}


			process.exit(0);

		} else {

			console.info('PROCESS ALREADY DEAD!');

			process.exit(1);

		}

	} else {

		console.error('PARAMETERS FAILURE');

		_print_help();

		process.exit(1);

	}

})(_settings);

