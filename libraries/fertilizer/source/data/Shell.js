
lychee.define('fertilizer.data.Shell').tags({
	platform: 'node'
}).supports(function(lychee, global) {

	if (typeof process !== 'undefined') {

		try {

			require('child_process');
			require('path');

			return true;

		} catch(err) {
		}

	}

	return false;

}).exports(function(lychee, global, attachments) {

	var _ROOT          = lychee.ROOT.lychee;
	var _child_process = require('child_process');
	var _path          = require('path');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function() {

		this.__stack = [];

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'fertilizer.data.Shell',
				'arguments':   []
			};

		},



		/*
		 * CUSTOM API
		 */

		exec: function(command, callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			var that = this;
			var args = command.split(' ').slice(1);
			var cmd  = command.split(' ')[0];
			var file = _ROOT + (cmd.charAt(0) !== '/' ? '/' : '') + cmd;
			var ext  = file.split('.').pop();
			var path = file.split('/').slice(0, -1).join('/');
			if (path.split('/').pop() === 'bin') {
				path = path.split('/').slice(0, -1).join('/');
			}


			if (ext === 'js') {

				args.reverse();
				args.push(file);
				args.push('env:node');
				args.reverse();

				file = _ROOT + '/bin/helper.sh';

			}


			if (callback !== null) {

				_child_process.execFile(file, args, {
					cwd: path
				}, function(error, stdout, stderr) {

					that.__stack.push({
						args:   args,
						file:   file,
						path:   path,
						stdout: stdout.toString(),
						stderr: stderr.toString()
					});


					if (error) {
						callback.call(scope, false);
					} else {
						callback.call(scope, true);
					}

				});

			}

		},

		trace: function(limit) {

			limit = typeof limit === 'number' ? (limit | 0) : null;


			var stack = this.__stack;
			if (limit !== null) {
				stack = stack.slice(stack.length - limit, limit);
			}


			stack.forEach(function(context) {

				var dir = context.path;
				var cmd = context.file;
				var out = context.stdout.trim();
				var err = context.stderr.trim();

				if (cmd.substr(0, dir.length) === dir) {
					cmd = '.' + cmd.substr(dir.length);
				}

				if (context.args.length > 0) {
					cmd += ' ';
					cmd += context.args.join(' ');
				}

				console.log('');
				console.log('cd ' + dir + ';');
				console.log(cmd + ';');
				console.log('');

				if (out.length > 0) {
					console.log(out);
				}

				if (err.length > 0) {
					console.error(err);
				}

				console.log('');

			});

		}

	};


	return Class;

});

