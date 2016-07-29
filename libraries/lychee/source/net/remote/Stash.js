
lychee.define('lychee.net.remote.Stash').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(remote) {

		_Service.call(this, 'stash', remote, _Service.TYPE.remote);



		/*
		 * INITIALIZATION
		 */

		this.bind('sync', function(data) {

			let main = global.MAIN || null;
			if (main !== null) {

				let stash = main.stash || null;
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
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.remote.Stash';
			data['arguments']   = [];


			return data;

		},



		/*
		 * CUSTOM API
		 */

		sync: function(assets) {

			assets = assets instanceof Object ? assets : null;


			if (assets !== null && this.tunnel !== null) {

				let data = {};

				for (let id in assets) {
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

