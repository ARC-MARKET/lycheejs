
var path = "../lychee";

require(path + '/core.js');
require(path + '/Builder.js');
require(path + '/Preloader.js');

// bootstrap.js requires the root path to this file.
require(path + '/platform/nodejs/bootstrap.js')(__dirname);


// Also requires game.WebServer
require('./source/Server.js');


lychee.debug = true;

lychee.rebase({
	lychee: path,
	game: './source'
});

lychee.tag({
	platform: [ 'nodejs' ]
});

lychee.build(function(lychee, global) {

	var settings = {
		base: './asset',
		port: 1337
	};

	new game.Server(settings);


	var root = __dirname;
	if (root.substr(0, 2) === 'C:') {
		root = root.split(/\\/).join('/');
		root = root.substr(2, root.length - 2);
	}


	root = root.split('/');
	root.splice(root.length - 1, 1);
	root = root.join('/');


	var settings = {
		root: root,
		port: 8080
	};

	new game.WebServer(settings);

}, typeof global !== 'undefined' ? global : this);

