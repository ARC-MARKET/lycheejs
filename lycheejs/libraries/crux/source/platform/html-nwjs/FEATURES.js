
(function(lychee, global) {

	const _BUFFER = {
		Buffer: function() {}
	};

	const _CHILD_PROCESS = {
		execFile: function(path, args) {}
	};

	const _FS = {
		readFile:      function(path, encoding, callback) {},
		readFileSync:  function(path, encoding) {},
		mkdirSync:     function(path, mode) {},
		unlinkSync:    function(path) {},
		writeFileSync: function(path, data, encoding) {},

		lstatSync:     function(path) {
			return {
				isDirectory: function() {}
			};
		}

	};

	const _Server = function(states) {

		this.allowHalfOpen  = false;
		this.pauseOnConnect = false;

	};

	_Server.prototype = {

		close:  function() {},
		listen: function(port, host) {},

		on: function(event, callback) {

			if (event === 'connection') {
				callback(new _Socket());
			}

		}

	};

	const _Socket = function(states) {

		this.allowHalfOpen = false;

	};

	_Socket.prototype = {
		destroy:            function() {},
		on:                 function(event, callback) {},
		removeAllListeners: function(event) {},
		setKeepAlive:       function(flag, delay) {},
		setNoDelay:         function(flag) {},
		setTimeout:         function(delay) {}
	};


	const _NET = {
		Server: _Server,
		Socket: _Socket
	};

	const _PATH = {
		dirname: function(path) {}
	};

	const _FEATURES = {

		require: function(id) {

			if (id === 'buffer')        return _BUFFER;
			if (id === 'child_process') return _CHILD_PROCESS;
			if (id === 'fs')            return _FS;
			if (id === 'net')           return _NET;
			if (id === 'path')          return _PATH;


			throw new Error('Cannot find module \'' + id + '\'');

		},

		process: {
			env: {
				APPDATA: null,
				HOME:    '/home/dev'
			},
			stdin: {
				on: function(event, callback) {}
			},
			stdout: {
				on:    function(event, callback) {},
				write: function(str) {}
			}
		},

		clearInterval: function(id) {},
		clearTimeout:  function(id) {},
		setInterval:   function(callback, delay) {},
		setTimeout:    function(callback, delay) {}

	};


	// XXX: This is an incremental platform of 'html'

	lychee.FEATURES['html-nwjs'] = _FEATURES;

})(lychee, typeof global !== 'undefined' ? global : this);

