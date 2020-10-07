
(function(lychee, global) {

	const _CONTEXT = {
		fillStyle:    '#000000',
		globalAlpha:  1.0,
		lineWidth:    1,
		strokeStyle:  '#000000'
	};

	_CONTEXT.prototype = {

		arc:          function(x, y, radius, start, end) {},
		beginPath:    function() {},
		closePath:    function() {},
		drawImage:    function(image, x, y, width, height, srcx, srcy, src_width, src_height) {},
		fill:         function() {},
		fillRect:     function(x, y, width, height) {},
		setTransform: function(x1, y1, z1, x2, y2, z2) {},
		lineTo:       function(x, y) {},
		moveTo:       function(x, y) {},
		stroke:       function() {},
		strokeRect:   function(x, y, width, height) {}

	};

	const _Canvas = function(width, height, options) {
		this.width  = 1337;
		this.height = 1337;
		this.__left = 0;
		this.__top  = 0;
	};

	_Canvas.prototype = {

		clear: function() {},

		getContext: function(context) {

			if (context === '2d') {
				return _CONTEXT;
			}

			return null;

		}

	};

	const _File = function(path, options, callback) {
		this.filesize = 1337;
	};

	_File.prototype = {
		openSync:  function(mode, callback) {},
		readSync:  function(bytes, callback) {},
		writeSync: function(buffer, callback) {},
		closeSync: function() {}
	};

	_File.read = function(path, options, callback) {
	};

	const _Socket = function(host, port) {
		this.binary       = false;
		this.encoding     = 'utf8';
		this.onconnect    = null;
		this.ondisconnect = null;
		this.ondrain      = null;
		this.onmessage    = null;
	};

	_Socket.prototype = {
		close:   function() {},
		connect: function(mode) {},
		listen:  function(mode) {},
		write:   function(data) {}
	};


	const _FEATURES = {

		Canvas:                   _Canvas,
		CanvasRenderingContext2D: _CONTEXT,
		File:                     _File,
		Socket:                   _Socket,

		addEventListener:      function(event, callback, bubble) {},
		clearInterval:         function(id) {},
		clearTimeout:          function(id) {},
		requestAnimationFrame: function(callback) {},
		setInterval:           function(callback, delay) {},
		setTimeout:            function(callback, delay) {},

		document: {

			canvas: {

				add:    function(canvas) {},
				remove: function(canvas) {}

			}

		},

		window: {

			innerWidth:  1337,
			innerHeight: 1337,
			left:        0,
			top:         0,

			_onblur:     null,
			_onfocus:    null,

			__nidium__:  {
				build:    'abcdef0123456789',
				revision: 'abcdef0123456789',
				version:  '0.2'
			},

			addEventListener:      function(event, callback) {},
			exec:                  function(cmd) {},
			openFileDialog:        function(types, callback) {},
			requestAnimationFrame: function(callback) {},
			setSize:               function(width, height) {}

		}

	};


	lychee.FEATURES['nidium'] = _FEATURES;

})(lychee, typeof global !== 'undefined' ? global : this);
