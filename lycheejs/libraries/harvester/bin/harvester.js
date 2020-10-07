#!/usr/local/bin/lycheejs-helper env:node


const _fs    = require('fs');
const _path  = require('path');
const _ROOT  = process.env.LYCHEEJS_ROOT || '/opt/lycheejs';
const _PID   = '/tmp/lycheejs-harvester.pid';
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

const _print_autocomplete = function(action, profile, flag) {

	let actions  = [ 'start', 'status', 'stop' ];
	let flags    = [ '--debug', '--sandbox' ];
	let profiles = _fs.readdirSync(_ROOT + '/libraries/harvester/profiles')
		.sort()
		.filter(val => val.endsWith('.json'))
		.map(val => val.substr(0, val.indexOf('.json')));


	let suggestions = [];
	let has_action  = actions.find(a => a === action);
	let has_profile = profiles.find(p => p === profile);
	let has_flag    = flags.find(f => f === flag);

	if (has_action && has_profile && has_flag) {
		// Nothing to suggest
	} else if (has_action && has_profile && flag) {
		suggestions = flags.filter(f => f.startsWith(flag));
	} else if (has_action && has_profile) {
		suggestions = flags;
	} else if (has_action && profile) {
		suggestions = profiles.filter(p => p.startsWith(profile));
	} else if (has_action) {
		suggestions = profiles;
	} else if (action) {
		suggestions = actions.filter(a => a.startsWith(action));
	} else {
		suggestions = actions;
	}

	return suggestions.sort();

};

const _print_help = function() {

	let profiles = _fs.readdirSync(_ROOT + '/libraries/harvester/profiles')
		.sort()
		.filter(val => val.endsWith('.json'))
		.map(val => val.substr(0, val.indexOf('.json')));


	console.log('');
	console.info('lychee.js ' + lychee.VERSION + ' Harvester');
	console.log('');
	console.log('Usage: lycheejs-harvester [Action] [Profile] [Flag]');
	console.log('');
	console.log('Usage Notes:');
	console.log('');
	console.log('    Profiles are stored in "/libraries/harvester/profiles".');
	console.log('');
	console.log('');
	console.log('Available Actions:');
	console.log('');
	console.log('    start        Start the Harvester instance.                        ');
	console.log('    status       Check whether or not a Harvester instance is running.');
	console.log('    stop         Stop (if any available) Harvester instance.          ');
	console.log('');
	console.log('Available Profiles:');
	console.log('');
	profiles.forEach(profile => console.log('    ' + profile));
	console.log('');
	console.log('Available Flags:');
	console.log('');
	console.log('    --debug      Enable debug messages.               ');
	console.log('    --sandbox    Enable sandbox without software bots.');
	console.log('');
	console.log('Examples:');
	console.log('');
	console.log('    lycheejs-harvester start development;          ');
	console.log('    lycheejs-harvester status;                     ');
	console.log('    lycheejs-harvester stop;                       ');
	console.log('    lycheejs-harvester start development --sandbox;');
	console.log('');

};

const _clear_pid = function() {

	let result = true;

	try {
		_fs.unlinkSync(_PID);
	} catch (err) {
		result = false;
	}

	return result;

};

const _read_pid = function() {

	let pid = null;

	try {

		let tmp = _fs.readFileSync(_PID, 'utf8');

		if (!isNaN(parseInt(tmp, 10))) {
			pid = parseInt(tmp, 10);
		}

	} catch (err) {
		pid = null;
	}

	return pid;

};

const _write_pid = function() {

	let result = false;

	try {
		_fs.writeFileSync(_PID, '' + process.pid, 'utf8');
	} catch (err) {
		result = false;
	}

	return result;

};

const _bootup = function(settings) {

	console.info('BOOTUP (' + process.pid + ')');


	lychee.ROOT.project = lychee.ROOT.lychee + '/libraries/harvester';

	lychee.init(null);
	lychee.pkg('build', 'node/main', environment => {

		lychee.init(environment, {
			debug:   settings.debug === true,
			sandbox: true
		}, sandbox => {

			lychee.ROOT.project = lychee.ROOT.lychee;

			if (sandbox !== null) {

				let lychee    = sandbox.lychee;
				let harvester = sandbox.harvester;


				// Show more debug messages
				lychee.debug = true;


				// This allows using #MAIN in JSON files
				sandbox.MAIN = new harvester.Main(settings);
				sandbox.MAIN.bind('destroy', code => process.exit(code));
				sandbox.MAIN.init();
				_write_pid();


				const _on_process_error = function() {
					_clear_pid();
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

				_clear_pid();

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
		action:  null,
		profile: null,
		debug:   false,
		sandbox: false
	};


	let action       = args.find(val => /(start|status|restart|stop)/g.test(val));
	let profile      = args.find(val => /([A-Za-z0-9-_.])/g.test(val) && val !== action);
	let debug_flag   = args.find(val => /--([debug]{5})/g.test(val));
	let sandbox_flag = args.find(val => /--([sandbox]{7})/g.test(val));


	if (action === 'start') {

		if (profile !== undefined) {

			settings.action = 'start';


			try {

				let stat1 = _fs.lstatSync(_ROOT + '/libraries/harvester/profiles/' + profile + '.json');
				if (stat1.isFile()) {

					let json = null;
					try {
						json = JSON.parse(_fs.readFileSync(_ROOT + '/libraries/harvester/profiles/' + profile + '.json', 'utf8'));
					} catch (err) {
					}

					if (json !== null) {
						settings.profile = json;
						settings.debug   = json.debug   === true;
						settings.sandbox = json.sandbox === true;
					}

				}

			} catch (err) {
			}

		}

	} else if (action !== undefined) {

		settings.action = action;

	}


	if (debug_flag !== undefined) {
		settings.debug = true;
	}

	if (sandbox_flag !== undefined) {
		settings.sandbox = true;
	}


	return settings;

})();



(function(settings) {

	/*
	 * IMPLEMENTATION
	 */

	let action      = settings.action;
	let has_profile = settings.profile !== null;


	if (action === 'start' && has_profile) {

		settings.profile.debug   = settings.debug   === true;
		settings.profile.sandbox = settings.sandbox === true;

		_bootup(settings.profile);

	} else if (action === 'status') {

		let pid = _read_pid();
		if (pid !== null) {

			console.log('harvester: -> Checking');
			console.info('harvester: -> Instance active ("' + pid + '").');

			process.exit(0);

		} else {

			console.log('harvester: -> Checking');
			console.error('harvester: -> Instance inactive.');

			process.exit(1);

		}

	} else if (action === 'stop') {

		let pid = _read_pid();
		if (pid !== null) {

			console.log('harvester: -> Stopping "' + pid + '"');

			let killed = false;

			try {

				process.kill(pid, 'SIGTERM');
				killed = true;

			} catch (err) {

				if (err.code === 'ESRCH') {
					killed = true;
				}

			}

			if (killed === true) {

				_clear_pid();

				console.info('harvester: -> SUCCESS');
				process.exit(0);

			} else {

				console.error('harvester: -> FAILURE');
				console.error('harvester: Please check whether process "' + pid + '" is already dead.');
				console.error('harvester: Current user possibly has no rights to kill processes.');

				process.exit(1);

			}

		} else {

			console.log('harvester: -> Stopping');
			console.info('harvester: -> SUCCESS');

			process.exit(0);

		}

	} else {

		console.error('PARAMETERS FAILURE');

		_print_help();

		process.exit(1);

	}

})(_SETTINGS);

