
lychee.define('lychee.net.client.Storage').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(client) {

		lychee.net.Service.call(this, 'storage', client, lychee.net.Service.TYPE.client);



		/*
		 * INITIALIZATION
		 */

		this.bind('sync', function(data) {

			var main = global.MAIN || null;
			if (main !== null) {

				var storage = main.storage || null;
				if (storage !== null) {

					storage.deserialize({
						objects: data.objects
					});

					storage.sync(true);

				}

			}

		}, this);

	};


	Composite.prototype = {

		/*
		 * CUSTOM API
		 */

		sync: function(objects) {

			objects = objects instanceof Array ? objects : null;


			if (objects !== null && this.tunnel !== null) {

				this.tunnel.send({
					timestamp: Date.now(),
					objects:   objects
				}, {
					id:    'storage',
					event: 'sync'
				});


				return true;

			}


			return false;

		}

	};


	return Composite;

});

