
lychee.define('studio.net.Server').includes([
	'lychee.net.Server'
]).exports((lychee, global, attachments) => {

	const _Server = lychee.import('lychee.net.Server');



	/*
	 * HELPERS
	 */

	const _on_stash_sync = function(data) {

		let main = this.main || null;
		if (main !== null) {

			let stash = main.stash || null;
			if (stash !== null) {

				let urls   = [];
				let assets = [];
				let root   = lychee.ROOT.project;

				lychee.ROOT.project = lychee.ROOT.lychee;

				for (let url in data.assets) {

					let asset = lychee.deserialize(data.assets[url]);
					if (asset !== null) {
						assets.push(asset);
						urls.push(url);
					}

				}

				stash.write(urls, assets);

				lychee.ROOT.project = root;

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.main = states.main || null;


		_Server.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function(remote) {

			console.log('studio.net.Server: Remote connected (' + remote.id + ')');


			let service = remote.getService('stash');
			if (service !== null) {
				service.bind('sync', _on_stash_sync, this);
			}

		}, this);

		this.bind('disconnect', remote => {
			console.log('studio.net.Server: Remote disconnected (' + remote.id + ')');
		}, this);


		this.connect();

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Server.prototype.serialize.call(this);
			data['constructor'] = 'studio.net.Server';


			return data;

		}

	};


	return Composite;

});

