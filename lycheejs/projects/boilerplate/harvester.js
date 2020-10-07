#!/usr/local/bin/lycheejs-helper env:node

const _ROOT  = process.env.LYCHEEJS_ROOT || '/opt/lycheejs';
const _PORT  = parseInt(process.argv[2], 10);
const _HOST  = process.argv[3] === 'null'    ? null : process.argv[3];
const _DEBUG = process.argv[4] === '--debug' ? true : false;

require(_ROOT + '/libraries/crux/build/node/dist.js')(__dirname);



/*
 * INITIALIZATION
 */

(function(lychee, global) {

	lychee.init(null);
	lychee.pkg('build', 'node/main', (environment, profile) => {

		if (environment !== null) {

			lychee.init(environment, {
				debug:   _DEBUG,
				sandbox: false,
				profile: {
					renderer: null,
					client:   null,
					server:   {
						host: _HOST,
						port: _PORT
					}
				}
			});

		}

	});

})(lychee, typeof global !== 'undefined' ? global : this);

