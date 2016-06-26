
lychee.define('tool.Main').requires([
	'lychee.data.HTML',
	'lychee.data.MD',
	'tool.API'
]).includes([
	'lychee.app.Main'
]).tags({
	platform: 'html'
}).supports(function(lychee, global) {

	if (global.location instanceof Object && typeof global.location.hash === 'string') {

		if (typeof global.onhashchange !== 'undefined') {
			return true;
		}

	}


	return false;

}).exports(function(lychee, global, attachments) {

	var _API             = lychee.import('tool.API');
	var _API_CACHE       = {};
	var _SRC_CACHE       = {};
	var _DATA            = {};
	var _HTML            = lychee.import('lychee.data.HTML');
	var _MD              = lychee.import('lychee.data.MD');



	/*
	 * HACKS BECAUSE FUCKING JAVASCRIPT IDIOTS
	 */

	(function(global) {

		global.onhashchange = function() {

			var elements  = [].slice.call(document.querySelectorAll('article:nth-of-type(1) table a'));
			var reference = global.location.hash.split('!')[1].split('#');

			elements.forEach(function(element) {
				element.classList.remove('active');
			});


			// Example: #!lychee.Debugger#methods-expose
			// reference[0] = 'lychee.Debugger';
			// reference[1] = 'methods-expose';


			_DATA.reference[0] = reference[0];
			_DATA.reference[1] = reference[1];


			_render_view('api', reference[0], reference[1]);

		};

	})(global);



	/*
	 * HELPERS
	 */

	var _load_documents = function() {

		_DATA.api.forEach(function(path) {

			var identifier = 'lychee.' + path.split('/').join('.');
			if (path.substr(0, 4) === 'core') {
				identifier = path === 'core/lychee' ? 'lychee' : 'lychee.' + path.split('/').pop();
			}

			var stuff = new Stuff('/libraries/lychee/api/' + path + '.md');

			stuff.onload = function(result) {
				_API_CACHE[identifier] = this.buffer;
			};

			stuff.load();

		});


		_DATA.src.filter(function(path) {

			if (path.substr(0, 8) === 'platform') {
				return path.substr(0, 13) === 'platform/html';
			}

			return true;

		}).forEach(function(path) {

			var identifier = 'lychee.' + path.split('/').join('.');
			if (path.substr(0, 8) === 'platform') {
				identifier = 'lychee.' + path.split('/').slice(2).join('.');
			} else if (path.substr(0, 4) === 'core') {
				identifier = path === 'core/lychee' ? 'lychee' : 'lychee.' + path.split('/').pop();
			}


			var stuff = new Stuff('/libraries/lychee/source/' + path + '.js', true);

			stuff.onload = function(result) {
				_SRC_CACHE[identifier] = this.buffer;
			};

			stuff.load();

		});

	};

	var _walk_directory = function(files, node, path) {

		if (node instanceof Array) {

			if (node.indexOf('js') !== -1 || node.indexOf('md') !== -1) {
				files.push(path);
			}

		} else if (node instanceof Object) {

			Object.keys(node).forEach(function(child) {
				_walk_directory(files, node[child], path + '/' + child);
			});

		}

	};

	var _package_definitions = function(json) {

		var files = [];

		if (json !== null) {
			_walk_directory(files, json, '');
		}

		return files.map(function(value) {
			return value.substr(1);
		}).sort(function(a, b) {
			if (a > b) return  1;
			if (a < b) return -1;
			return 0;
		});

	};

	var _render_navi = function(data) {

		var code       = '';
		var documented = data.api.map(function(path) {

			if (path.substr(0, 4) === 'core') {
				return path === 'core/lychee' ? 'lychee' : 'lychee.' + path.split('/').pop();
			} else {
				return 'lychee.' + path.split('/').join('.');
			}

		});
		var definitions = data.src.map(function(path) {

			if (path.substr(0, 8) === 'platform') {
				return 'lychee.' + path.split('/').slice(2).join('.');
			} else if (path.substr(0, 4) === 'core') {
				return path === 'core/lychee' ? 'lychee' : 'lychee.' + path.split('/').pop();
			} else {
				return 'lychee.' + path.split('/').join('.');
			}

		}).unique().sort(function(a, b) {
			if (a > b) return  1;
			if (a < b) return -1;
			return 0;
		});


		code += '<tr><td>';
		code += '<ul class="select">';
		code += definitions.filter(function(id) {
			return documented.indexOf(id) !== -1;
		}).map(function(id) {
			return '<li><input type="radio" name="reference" value="' + id + '"><span>' + id + '</span></li>';
		}).join('');
		code += '</ul>';
		code += '</td></tr>';


		ui.render(code, 'article:nth-of-type(1) table');
		ui.render('Definitions (' + documented.length + '/' + definitions.length + ')', 'article:nth-of-type(1) h3');


		setTimeout(function() {

			var elements = [].slice.call(document.querySelectorAll('article:nth-of-type(1) table a'));
			var hash     = (location.hash.split('!')[1] || 'lychee').split('#')[0];
			var index    = elements.map(function(element) {
				return element.innerHTML;
			}).indexOf(hash);


			if (index !== -1) {
				elements[index].classList.add('active');
			}

		}, 200);

	};

	var _render_view = function(view, identifier, reference) {

		var code      = '';
		var markdown  = _API_CACHE[identifier] || '';
		var generated = new _API(identifier, _SRC_CACHE[identifier] || '').toMD();


		if (view === 'code') {
			markdown = _SRC_CACHE[identifier] || '';
		}


		if (markdown === '') {

			if (view === 'api') {

				code += '<article id="constructor">';
				code += '<pre><code class="javascript">' + identifier + ';</code></pre>';
				code += '<textarea>' + generated + '</textarea>';
				code += '</article>';


				ui.render(code, 'article:nth-of-type(2) div');

			} else if (view === 'code') {

				code += '<pre><code class="javascript">\n\nconsole.log(\'No source code available.\');\n\n</code></pre>';


				ui.render(code, 'article:nth-of-type(2) div');


			} else if (view === 'edit') {

				code += '<article id="constructor">';
				code += '<pre><code class="javascript">' + identifier + ';</code></pre>';
				code += '<textarea>' + (markdown || generated) + '</textarea>';
				code += '</article>';


				ui.render(code, 'article:nth-of-type(2) div');

			}

		} else {

			if (view === 'api') {

				var seen = {
					constructor: false,
					events:      false,
					methods:     false,
					properties:  false
				};


				code += _HTML.encode(_MD.decode(markdown));


				ui.render(code, 'article:nth-of-type(2) div');


				setTimeout(function() {

					var element = global.document.querySelector('#' + reference);
					if (element !== null) {

						element.scrollIntoView({
							block:     'start',
							behaviour: 'smooth'
						});

					}

				}, 200);

			} else if (view === 'code') {

				code += '<pre><code class="javascript">';
				code += markdown;
				code += '</pre></code>';


				ui.render(code, 'article:nth-of-type(2) div');

			} else if (view === 'edit') {

				code += '<article id="constructor">';
				code += '<pre><code class="javascript">' + identifier + ';</code></pre>';
				code += '<textarea>' + (markdown || generated) + '</textarea>';
				code += '</article>';


				ui.render(code, 'article:nth-of-type(2) div');

			}


			setTimeout(function() {

				var links = [].slice.call(global.document.querySelectorAll('a'));
				if (links.length > 0) {

					links.forEach(function(link) {

						var hash = (global.location.hash.split('!')[1] || 'lychee').split('#')[0];
						var href = link.getAttribute('href');
						if (href.substr(0, 1) !== '#') {
							href = '#!' + href;
						} else {
							href = '#!' + hash + href;
						}

						link.setAttribute('href', href);

					});

				}

			}, 0);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({

			client:   null,
			input:    null,
			jukebox:  null,
			renderer: null,
			server:   null,

			viewport: {
				fullscreen: false
			}

		}, data);


		lychee.app.Main.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function(oncomplete) {

			var config = new Config('/libraries/lychee/lychee.pkg');
			var that   = this;

			config.onload = function(result) {

				if (result === true) {

					_DATA = {
						api:       _package_definitions(this.buffer.api.files    || null),
						src:       _package_definitions(this.buffer.source.files || null),
						reference: (location.hash.split('!')[1] || 'lychee').split('#'),
						view:      'api'
					};


					oncomplete(true);

				} else {

					oncomplete(false);

				}

			};

			config.load();

		}, this);

		this.bind('init', function() {

			_render_navi(_DATA);
			_load_documents();

			setTimeout(function() {
				_render_view('api', _DATA.reference[0], _DATA.reference[1] || null);
			}, 1000);

		}, this, true);

		this.bind('api', function() {
			_render_view('api', _DATA.reference[0], _DATA.reference[1] || null);
		}, this);

		this.bind('code', function() {
			_render_view('code', _DATA.reference[0], _DATA.reference[1] || null);
		}, this);

		this.bind('edit', function() {
			_render_view('edit', _DATA.reference[0], _DATA.reference[1] || null);
		}, this);

		this.bind('download', function() {

			var id   = _DATA.reference[0] || '';
			var blob = _API_CACHE[id] || null;

			if (blob === null) {

				var textarea = document.querySelector('textarea');
				if (textarea !== null) {
					blob = _API_CACHE[id] = '\n' + textarea.value.trim() + '\n\n';
				}

			}


			var filename = id.split('.').pop() + '.md';
			var buffer   = new Buffer(blob, 'utf8');

			_API_CACHE[id] = blob;

			ui.download(filename, buffer);

		}, this);

		this.bind('submit', function(id, settings) {

			if (id === 'settings') {

				var reference = settings.reference || null;
				if (reference !== null) {
					global.location.hash = '!' + reference;
				}

			}

		}, this);

	};


	Class.prototype = {

	};


	return Class;

});
