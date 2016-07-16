
lychee.define('lychee.net.remote.Stash').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(remote) {

		lychee.net.Service.call(this, 'stash', remote, lychee.net.Service.TYPE.remote);



		/*
		 * INITIALIZATION
		 */

		this.bind('sync', function(data) {

			var main = global.MAIN || null;
			if (main !== null) {

				var stash = main.stash || null;
				if (stash !== null) {

					stash.deserialize({
						assets: data.assets
					});

					stash.sync(true);

				}

			}

		}, this);

	};


	Composite.prototype = {

		/*
		 * CUSTOM API
		 */

		sync: function(assets) {

			assets = assets instanceof Object ? assets : null;


			if (assets !== null && this.tunnel !== null) {

				var data = {};

				for (var id in assets) {
					data[id] = lychee.serialize(assets[id]);
				}


				this.tunnel.send({
					timestamp: Date.now(),
					assets:    data
				}, {
					id:    'stash',
					event: 'sync'
				});


				return true;

			}


			return false;

		}

	};


	return Composite;

});

