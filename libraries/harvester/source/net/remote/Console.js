
lychee.define('harvester.net.remote.Console').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	var _Service = lychee.import('lychee.net.Service');
	var _console = global.console;



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(remote) {

		_Service.call(this, 'console', remote, _Service.TYPE.remote);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.remote.Console';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		index: function() {

			var tunnel = this.tunnel;
			if (tunnel !== null) {

				tunnel.send(lychee.serialize(_console), {
					id:    this.id,
					event: 'sync'
				});

			}

		},

		sync: function() {
			this.index();
		}

	};


	return Composite;

});

