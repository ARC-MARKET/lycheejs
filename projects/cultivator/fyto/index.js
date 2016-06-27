
fyto = (function(global) {

	/*
	 * FEATURE DETECTION
	 */

	var _HTML_IMPORT = false;



	/*
	 * HELPERS
	 */

	var _get_namespace = function(identifier) {

		var pointer = this;

		var ns = identifier.split('.'); ns.pop();
		for (var n = 0, l = ns.length; n < l; n++) {

			var name = ns[n];

			if (pointer[name] === undefined) {
				pointer[name] = {};
			}

			pointer = pointer[name];

		}


		return pointer;

	};

	var _polyfill_template = function(identifier, template) {

		var code = template.innerHTML;
		if (code.length > 0) {
			code = _polyfill_code(identifier, code);
		}


		var i1 = code.indexOf('<content>');
		var i2 = code.indexOf('</content>', i1);
		if (i1 !== -1 && i2 !== -1) {
			code = code.substr(0, i1) + code.substr(i1 + 9, i2 - i1 - 9) + code.substr(i2 + 10);
		}


		template.innerHTML = code;


		return template;

	};

	var _polyfill_code = function(identifier, buffer) {

		var i1 = buffer.indexOf('<style>');
		var i2 = buffer.indexOf('</style>', i1);


		if (i1 !== -1 && i2 !== -1) {

			var sheet = (buffer.substr(i1 + 7, i2 - i1 - 7)).trim();
			if (sheet.length > 0) {

				sheet = sheet.split('\n').map(function(line) {

					var tmp = line.trim();
					if (tmp.substr(0, 6) === ':host(') {

						var i3 = tmp.indexOf(')', 6);
						var i4 = tmp.indexOf(' ', 6);

						if (i3 !== -1 && i3 < i4) {
							return identifier + tmp.substr(6, i3 - 6) + tmp.substr(i3 + 1);
						}

					} else if (tmp.substr(0, 5) === ':host') {
						return identifier + tmp.substr(5);
					} else if (tmp.indexOf(':host') !== -1) {
						return tmp.split(':host').join(identifier);
					}


					return tmp;

				}).map(function(line) {

					var tmp = line.trim();
					if (tmp.substr(0, 9) === '::content') {
						return identifier + tmp.substr(9);
					} else if (tmp.indexOf(' ::content') !== -1) {
						return tmp.split(' ::content').join('');
					}


					return tmp;

				}).join('\n');


				var element = global.document.createElement('style');
				if (element !== null) {
					element.innerHTML = sheet;
					global.document.head.appendChild(element);
				}

			}


			buffer = (buffer.substr(0, i1) + buffer.substr(i2 + 8)).trim();

		}


		buffer = buffer.split('\n').map(function(val) {
			return val.trim();
		}).join('');


		return buffer;

	};



	/*
	 * IMPLEMENTATION
	 */

	var _ONCHANGE      = {};
	var _ONINIT        = {};
	var _LAZY_ONINIT   = {};
	var _LAZY_ONCHANGE = {};


	var fyto = {

		define: function(identifier, template) {

			_HTML_IMPORT               = true;
			_LAZY_ONINIT[identifier]   = [];
			_LAZY_ONCHANGE[identifier] = [];


			var ns       = _get_namespace.call(global, identifier);
			var id       = identifier.split('.').pop();
			var tag      = identifier.split('.').join('-');
			var wrapper  = Object.create(HTMLDivElement.prototype);
			var template = _polyfill_template(tag, template);
			var instance = Object.assign(wrapper, {

				attributeChangedCallback: function(name, oldvalue, newvalue) {

					var change = _ONCHANGE[identifier] || null;
					if (change !== null) {
						change.call(this, name, oldvalue, newvalue);
					} else {
						_LAZY_ONCHANGE[identifier].push(this);
					}


					// XXX: Fuck those Mozilla Monkey Retards.

					setTimeout(function() {

						var onchange = _ONCHANGE[identifier] || null;
						if (onchange !== null) {

							for (var l = 0, ll = _LAZY_ONCHANGE[identifier].length; l < ll; l++) {
								onchange.call(_LAZY_ONCHANGE[identifier][l]);
							}

							_LAZY_ONCHANGE[identifier] = [];

						}

					}, 0);

				},

				createdCallback: function() {

					var clone   = template.cloneNode(true);
					var shadow  = clone.innerHTML;
					var content = this.innerHTML;


					if (shadow.length > 0) {
						this.innerHTML = shadow + '' + content;
						this.__SHADOW = null;
					}

					var init = _ONINIT[identifier] || null;
					if (init !== null) {
						init.call(this);
					} else {
						_LAZY_ONINIT[identifier].push(this);
					}


					// XXX: Fuck those Mozilla Monkey Retards.

					setTimeout(function() {

						var oninit = _ONINIT[identifier] || null;
						if (oninit !== null) {

							for (var l = 0, ll = _LAZY_ONINIT[identifier].length; l < ll; l++) {
								oninit.call(_LAZY_ONINIT[identifier][l]);
							}

							_LAZY_ONINIT[identifier] = [];

						}

					}, 0);

				}

			});


			Object.defineProperty(instance, '_init', {

				get: function() {

					return _ONINIT[identifier] || null;

				},

				set: function(val) {

					var oldinit = _ONINIT[identifier] || null;
					if (oldinit === null) {

						if (typeof val === 'function') {
							_ONINIT[identifier] = val;
						}

					}

				}

			});

			Object.defineProperty(instance, '_change', {

				get: function() {

					return _ONCHANGE[identifier] || null;

				},

				set: function(val) {

					if (typeof val === 'function') {
						_ONCHANGE[identifier] = val;
					}

				}

			});


			if (ns !== null) {

				ns[id] = global.document.registerElement(tag, {
					prototype: instance
				});

			}


			return instance;

		}

	};


	global.document.addEventListener('DOMContentLoaded', function(event) {

		setTimeout(function() {

			if (_HTML_IMPORT === false) {

				if (typeof global.document.baseURI === 'undefined') {

					Object.defineProperty(global.document, 'baseURI', {
						get: function() {
							var base = this.querySelector('base');
							return base !== null ? base.href : window.location.href;
						},
						configurable: true
					});

				}


				var links = [].slice.call(global.document.head.querySelectorAll('link[rel="import"]'));
				if (links.length > 0) {

					links.forEach(function(link) {

						var url = link.getAttribute('href');
						if (url !== null) {

							var xhr = new XMLHttpRequest();

							xhr.responseType = 'text';
							xhr.open('GET', url);

							xhr.onload = function() {

								if (xhr.status === 200 || xhr.status === 304) {

									if (xhr.response.length > 0) {

										var doc  = global.document.implementation.createHTMLDocument(url);
										var base = doc.createElement('base');
										var meta = doc.createElement('meta');
										var body = doc.createElement('body');


										base.setAttribute('href',    url);
										meta.setAttribute('charset', 'utf-8');

										if (typeof doc.baseURI === 'undefined') {
											Object.defineProperty(doc, 'baseURI', { value: url });
										} else {
											doc.baseURI = url;
										}


										doc.head.appendChild(meta);
										doc.head.appendChild(base);


										doc.open();


										if (doc.body !== null) {
											doc.body.innerHTML = xhr.response;
										} else {
											doc.write('<body>' + xhr.response + '</body>');
										}


										var scripts = [].slice.call(doc.querySelectorAll('script'));
										if (scripts.length > 0) {

											scripts.forEach(function(script) {

												var scope = {
													document: {
														querySelector: function(selectors) {
															return global.document.querySelector(selectors);
														},
														querySelectorAll: function(selectors) {
															return global.document.querySelectorAll(selectors);
														},
														currentScript: {
															ownerDocument: doc
														}
													}
												};


												try {

													with (scope) {
														eval(script.innerHTML);
													}

												} catch(e) {
													console.log(e);

												}

											});

										}

									}

								}

							};

							xhr.onerror = function() {
								// XXX: Do nothing
							};

							xhr.send(null);

						}

					});

				}

			}

		}, 500);

	});



	return fyto;

})(typeof global !== 'undefined' ? global : this);

