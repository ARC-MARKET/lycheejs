
lychee.define('lychee.net.Remote').requires([
	'lychee.net.remote.Debugger',
	'lychee.net.remote.Stash',
	'lychee.net.remote.Storage'
]).includes([
	'lychee.net.Tunnel'
]).exports(function(lychee, global, attachments) {

	var _Debugger = lychee.import('lychee.net.remote.Debugger');
	var _Stash    = lychee.import('lychee.net.remote.Stash');
	var _Storage  = lychee.import('lychee.net.remote.Storage');
	var _Tunnel   = lychee.import('lychee.net.Tunnel');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		_Tunnel.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		if (lychee.debug === true) {

			this.bind('connect', function() {
				this.addService(new _Debugger(this));
			}, this);

		}


		this.bind('connect', function() {

			this.addService(new _Stash(this));
			this.addService(new _Storage(this));

		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = _Tunnel.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.Remote';


			return data;

		}

	};


	return Class;

});

