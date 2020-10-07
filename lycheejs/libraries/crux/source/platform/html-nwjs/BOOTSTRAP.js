
(function(lychee, global) {

	const _Buffer = require('buffer').Buffer;



	/*
	 * FEATURE DETECTION
	 */

	(function(location, selfpath) {

		let origin = location.origin || '';
		let cwd    = (location.pathname || '');
		let proto  = origin.split(':')[0];


		// Hint: CDNs might have no proper redirect to index.html
		if (/\.(htm|html)$/g.test(cwd.split('/').pop()) === true) {
			cwd = cwd.split('/').slice(0, -1).join('/');
		}


		if (/^(http|https)$/g.test(proto)) {

			// Hint: The harvester (HTTP server) understands
			// /projects/* and /libraries/* requests.

			lychee.ROOT.lychee = '';


			if (cwd !== '') {
				lychee.ROOT.project = cwd === '/' ? '' : cwd;
			}

		} else if (/^(app|file|chrome-extension)$/g.test(proto)) {

			let tmp1 = selfpath.indexOf('/libraries/lychee');
			let tmp2 = selfpath.indexOf('://');

			if (tmp1 !== -1 && tmp2 !== -1) {
				lychee.ROOT.lychee = selfpath.substr(0, tmp1).substr(tmp2 + 3);
			} else if (tmp1 !== -1) {
				lychee.ROOT.lychee = selfpath.substr(0, tmp1);
			}


			if (typeof process !== 'undefined') {
				cwd      = process.cwd() || '';
				selfpath = cwd.split('/').slice(0, -1).join('/');
			}


			let tmp3 = selfpath.split('/').slice(0, 3).join('/');
			if (tmp3.startsWith('/opt/lycheejs')) {
				lychee.ROOT.lychee = tmp3;
			}


			if (cwd !== '') {
				lychee.ROOT.project = cwd;
			}

		}

	})(global.location || {}, (global.document.currentScript || {}).src || '');



	/*
	 * BUFFER FIXES
	 */

	Buffer.isBuffer = function(buffer) {

		if (buffer instanceof Buffer) {
			return true;
		} else if (buffer instanceof _Buffer) {
			return true;
		}

		return false;

	};

})(this.lychee, this);

