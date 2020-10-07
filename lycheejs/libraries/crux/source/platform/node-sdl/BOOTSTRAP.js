
(function(lychee, global) {

	(function(process, selfpath) {

		let tmp1 = selfpath.indexOf('/libraries/lychee');
		if (tmp1 !== -1) {
			lychee.ROOT.lychee = selfpath.substr(0, tmp1);
		}

		let tmp2 = selfpath.split('/').slice(0, 3).join('/');
		if (tmp2.startsWith('/opt/lycheejs')) {
			lychee.ROOT.lychee = tmp2;
		}

		let tmp3 = process.env.LYCHEEJS_ROOT || '';
		if (tmp3 !== '') {
			lychee.ROOT.lychee = tmp3;
		}

		let cwd = typeof process.cwd === 'function' ? process.cwd() : '';
		if (cwd !== '') {
			lychee.ROOT.project = cwd;
		}

	})(global.process || {}, typeof __filename === 'string' ? __filename : '');

})(lychee, global);

