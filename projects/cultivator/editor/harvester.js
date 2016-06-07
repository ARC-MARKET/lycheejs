#!/usr/local/bin/lycheejs-helper env:node



/*
 * BOOTSTRAP
 */

var _root = process.argv[2];
var _port = parseInt(process.argv[3], 10);
var _host = process.argv[4] === 'null' ? null : process.argv[4];

require(_root + '/libraries/lychee/build/node/core.js')(__dirname);



/*
 * INITIALIZATION
 */

(function(lychee, global) {

	lychee.pkginit('node/main', {
		debug:   false,
		sandbox: false
	}, {
		renderer: null,
		client:   null,
		server:   {
			host: _host,
			port: _port
		}
	});

})(lychee, typeof global !== 'undefined' ? global : this);

