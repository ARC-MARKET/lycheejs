
(function(global) {

	const _CACHE = [];

	const _PROPERTIES = {
		html:  'innerHTML',
		state: 'className'
	};

	const Wrap = function(element) {

		let cache = _CACHE.find(c => c.element === element) || null;
		if (cache !== null) {
			return cache.instance;
		}

		this.element = element;
		this.type    = element.tagName.toLowerCase();

		_CACHE.push({
			element:  element,
			instance: this
		});

	};

	Wrap.prototype = {

		appendTo: function(other) {

			if (other.element !== null) {
				other.element.appendChild(this.element);
			} else {
				other.appendChild(this.element);
			}

			return this;

		},

		clear: function() {

			if (this.element.parentNode !== null) {
				this.element.parentNode.removeChild(this.element);
			}

			return this;

		},

		onclick: function(callback) {

			this.element.onclick = function() {
				callback();
				return false;
			};

			return this;

		},

		query: function(query) {

			let element = this.element.querySelector(query);
			if (element !== null) {
				return $(element);
			}

			return null;

		},

		get: function(name) {

			let data = null;
			let prop = _PROPERTIES[name] || name;

			if (this.element[prop] !== undefined) {
				data = this.element[prop];
			}

			return data;

		},

		set: function(options) {

			for (let o in options) {

				if (typeof this[o] === 'function') {
					this[o](options[o]);
				} else {
					this.element.setAttribute(o, options[o]);
				}

			}

			return this;

		}

	};


	Object.keys(_PROPERTIES).forEach(prop => {

		Wrap.prototype[prop] = function(value) {
			this.element[_PROPERTIES[prop]] = value;
		};

	});



	const $ = function(name) {

		if (name instanceof Element) {

			return new Wrap(name);

		} else if (typeof name === 'string') {

			if (name.startsWith('#') || name.startsWith('.')) {

				let elements = Array.from(global.document.querySelectorAll(name));
				if (elements.length > 1) {
					return elements.map(element => new Wrap(element));
				} else if (elements.length === 1) {
					return new Wrap(elements[0]);
				}

			} else {

				let tmp  = name.split(/\.|\[|\]/g).filter(v => v !== '');
				let type = tmp[0] || '';
				if (type !== '') {

					let element = global.document.createElement(type);
					let state   = tmp[1] || '';
					if (state !== '') {
						element.className = state;
					}

					return new Wrap(element);

				}

			}

		}


		return null;

	};


	global.$ = $;

})(typeof window !== 'undefined' ? window : this);

