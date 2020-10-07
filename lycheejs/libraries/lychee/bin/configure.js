#!/usr/local/bin/lycheejs-helper env:node

const _ROOT = process.env.LYCHEEJS_ROOT || '/opt/lycheejs';

require(_ROOT + '/libraries/crux/build/node/dist.js')(__dirname);



/*
 * INITIALIZATION
 */

(function(lychee, global) {

	const _fs      = require('fs');
	const _path    = require('path');
	const _process = process;


	lychee.init(null);



	/*
	 * HELPERS
	 */

	const _TEMPLATE_DEFINITION = (function () {/*
		lychee.define('{{identifier}}').requires([{{requires}}]).exports((lychee, global, attachments) => {

			const Module = {

				// deserialize: function(blob) {},

				serialize: function() {

					return {
						'reference': '{{identifier}}',
						'arguments': []
					};

				}

			};

			return Module;

		});

	*/}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].split('\n').map(line => line.substr(2)).join('\n');



	console.log('Distributing lychee.js Library');

	let pkg = new lychee.Package({
		id:   'lychee',
		url:  '/libraries/lychee/lychee.pkg',
		type: 'source'
	});

	setTimeout(_ => {

		let template = '' + _TEMPLATE_DEFINITION;
		let requires = pkg.getDefinitions().filter(id => id !== 'DIST').map(id => pkg.id + '.' + id);

		template = template.replace('{{identifier}}', 'lychee.DIST');
		template = template.replace('{{identifier}}', 'lychee.DIST');
		template = template.replace('{{requires}}',   '\n\t' + requires.map(id => '\'' + id + '\'').join(',\n\t') + '\n');
		template = '\n' + template.trim() + '\n';


		let result = true;
		let path   = _path.resolve(_ROOT, './libraries/lychee/source/DIST.js');

		try {
			_fs.writeFileSync(path, template, 'utf8');
		} catch (err) {
			result = false;
		}


		if (result === true) {
			console.info('SUCCESS');
		} else {
			console.error('FAILURE');
			_process.exit(1);
		}

	}, 200);

})(lychee, typeof global !== 'undefined' ? global : this);

