
lychee.define('harvester.net.server.Redirect').exports((lychee, global, attachments) => {

	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		/*
		 * MODULE API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'harvester.net.server.Redirect',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		receive: function(payload, headers) {

			payload = payload instanceof Buffer ? payload : null;
			headers = headers instanceof Object ? headers : {};


			let tunnel = this.tunnel;
			let url    = headers['url'];

			if (url.includes('?')) {
				url = url.split('?')[0];
			}

			// Multi-project mode /index.html
			if (url === '/') {

				tunnel.send('SHIT', {
					'status':   '301 Moved Permanently',
					'location': '/index.html'
				});

				return true;


			// Multi-project mode /projects/*
			} else if (url.startsWith('/projects')) {

				let identifier = url.split('/').slice(0, 3).join('/');
				let project    = lychee.import('MAIN')._projects[identifier] || null;
				if (project !== null) {

					let path = '/' + url.split('/').slice(3).join('/');
					if (path === identifier || path === identifier + '/' || path === '/') {

						let info = project.filesystem.info('/index.html');
						if (info !== null) {

							tunnel.send('', {
								'status':   '301 Moved Permanently',
								'location': identifier + '/index.html'
							});

							return true;

						}

					}

				}

			}


			return false;

		}

	};


	return Module;

});

