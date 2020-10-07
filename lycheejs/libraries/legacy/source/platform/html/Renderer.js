
lychee.define('legacy.Renderer').tags({
	platform: 'html'
}).includes([
	'lychee.Renderer'
]).supports((lychee, global) => {

	if (
		typeof global.document !== 'undefined'
		&& typeof global.document.createElement === 'function'
	) {

		try {

			let element = global.document.createElement('custom-wrapper');
			if ('transform' in element.style) {
				return true;
			}

		} catch (err) {
		}

	}


	return false;

}).exports((lychee, global, attachments) => {

	const _Renderer = lychee.import('lychee.Renderer');
	const _CACHE    = {
		elements:    [],
		entities:    [],
		stylesheets: {},
		templates:   {}
	};



	/*
	 * HELPERS
	 */

	const _render_template = function(identifier, asset) {

		let element = null;

		if (asset.buffer !== null) {

			let wrapper  = document.createElement('custom-wrapper');
			let raw_html = asset.buffer.toString('utf8');
			let dynamic  = /\$\{([A-Za-z]+)\}/g.test(raw_html);

			wrapper.innerHTML = raw_html;

			let tmp = wrapper.querySelector('template');
			if (tmp !== null) {

				element = global.document.createElement(identifier);
				element._template = raw_html;
				element._dynamic  = dynamic;
				element.innerHTML = tmp.innerHTML;

			}

		}

		return element;

	};

	const _render_stylesheet = function(identifier, asset) {

		let stylesheet = null;

		if (asset.buffer !== null) {

			let raw_css = asset.buffer.toString('utf8');

			raw_css += '\n' + identifier + '{\ndisplay:block;\nposition: absolute;\n}';
			raw_css  = raw_css.split('\n').map(line => {

				let tmp = line.trim();
				if (tmp.startsWith(':host(')) {

					let i3 = tmp.indexOf(')', 6);
					let i4 = tmp.indexOf(' ', 6);

					if (i3 !== -1 && i3 < i4) {
						return identifier + tmp.substr(6, i3 - 6) + tmp.substr(i3 + 1);
					}

				} else if (tmp.startsWith(':host')) {
					return identifier + tmp.substr(5);
				} else if (tmp.indexOf(':host') !== -1) {
					return tmp.split(':host').join(identifier);
				}


				return tmp;

			}).map(line => {

				let tmp = line.trim();
				if (tmp.startsWith('::content')) {
					return identifier + ' content ' + tmp.substr(9);
				} else if (tmp.indexOf(' ::content') !== -1) {
					return tmp.split(' ::content').join(' content');
				}


				return tmp;

			}).join('\n');

			stylesheet = global.document.createElement('style');

			if (stylesheet !== null) {
				stylesheet.setAttribute('data-identifier', identifier);
				stylesheet.innerHTML = raw_css;
				global.document.head.appendChild(stylesheet);
			}

		}

		return stylesheet;

	};

	const _render_element = function(entity, map) {

		let layer   = map.layer  || null;
		let wrapper = map.wrapper || null;

		if (wrapper === null) {

			if (layer !== null) {

				let index = _CACHE.entities.indexOf(layer);
				if (index !== -1) {
					wrapper = _CACHE.elements[index]._content;
				}

			}

		}


		let identifier = entity.displayName.split('.').join('-');
		let template   = _CACHE.templates[identifier]   || null;
		let stylesheet = _CACHE.stylesheets[identifier] || null;


		if (template === null) {
			template = _CACHE.templates[identifier] = _render_template(identifier, map.template);
		}

		if (stylesheet === null) {
			stylesheet = _CACHE.stylesheets[identifier] = _render_stylesheet(identifier, map.stylesheet);
		}


		let element = template.cloneNode(true);
		let content = element.querySelector('content');


		entity._element = element;

		element._entity   = entity;
		element._content  = content;
		element._garbage  = false;
		element._dynamic  = template._dynamic;
		element._template = template._template;

		element.style.width  = entity.width  + 'px';
		element.style.height = entity.height + 'px';


		if (wrapper !== null) {
			wrapper.appendChild(element);
		} else {
			this.__foreground.appendChild(element);
		}


		return element;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.__background = global.document.createElement('div');
		this.__background.className = 'lychee-Renderer';

		this.__foreground = global.document.createElement('div');
		this.__foreground.className = 'lychee-Renderer';


		global.document.body.appendChild(this.__background);
		global.document.body.appendChild(this.__foreground);


		_Renderer.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.__background.style.position        = 'absolute';
		this.__background.style.backgroundColor = this.background;
		this.__background.style.zIndex          = 0;
		this.__foreground.style.position        = 'absolute';
		this.__foreground.style.backgroundColor = 'transparent';
		this.__foreground.style.zIndex          = 500;
		this.__canvas.style.position            = 'absolute';
		this.__canvas.style.pointerEvents       = 'none';
		this.__canvas.style.zIndex              = 1000;

	};


	Composite.prototype = {

		destroy: function() {

			let background = this.__background;
			if (background.parentNode !== null) {
				background.parentNode.removeChild(background);
			}

			let foreground = this.__foreground;
			if (foreground.parentNode !== null) {
				foreground.parentNode.removeChild(foreground);
			}

			return true;

		},



		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Renderer.prototype.serialize.call(this);
			data['constructor'] = 'legacy.Renderer';


			return data;

		},



		/*
		 * SETTERS AND GETTERS
		 */

		setBackground: function(color) {

			color = /(#[AaBbCcDdEeFf0-9]{6})/g.test(color) ? color : null;


			if (color !== null) {

				this.background = color;
				this.__background.style.backgroundColor = color;

				return true;

			}


			return false;

		},

		setWidth: function(width) {

			width = typeof width === 'number' ? width : null;


			_Renderer.prototype.setWidth.call(this, width);


			this.__foreground.style.width = this.width + 'px';
			this.__background.style.width = this.width + 'px';


			return true;

		},

		setHeight: function(height) {

			height = typeof height === 'number' ? height : null;


			_Renderer.prototype.setHeight.call(this, height);


			this.__foreground.style.height = this.height + 'px';
			this.__background.style.height = this.height + 'px';


			return true;

		},



		/*
		 * BUFFER INTEGRATION
		 */

		clear: function(buffer) {

			buffer = buffer instanceof Object ? buffer : null;


			if (buffer !== null) {

				buffer.clear();

			} else {

				let ctx = this.__ctx;

				ctx.clearRect(0, 0, this.width, this.height);


				for (let e = 0, el = _CACHE.elements.length; e < el; e++) {
					_CACHE.elements[e]._garbage = true;
				}

			}


			return true;

		},

		flush: function() {

			for (let e = 0, el = _CACHE.elements.length; e < el; e++) {

				let element = _CACHE.elements[e];
				if (element._garbage === true) {

					if (element.parentNode !== null) {
						element.parentNode.removeChild(element);
					}

					_CACHE.elements.splice(e, 1);
					_CACHE.entities.splice(e, 1);

					el--;
					e--;

				}

			}


			return true;

		},



		/*
		 * CUSTOM API
		 */

		renderComponent: function(x1, y1, entity, map, values) {

			x1     = x1 | 0;
			y1     = y1 | 0;
			entity = entity instanceof Object ? entity : null;
			map    = map instanceof Object    ? map    : {};
			values = values instanceof Object ? values : null;


			if (entity !== null) {

				let element = null;
				let index   = _CACHE.entities.indexOf(entity);

				if (index !== -1) {

					element = _CACHE.elements[index] || null;

				} else {

					element = _render_element.call(this, entity, map);

					_CACHE.elements.push(element);
					_CACHE.entities.push(entity);

				}


				if (element !== null) {

					if (values !== null && element._dynamic === true) {
						element.innerHTML = element._template.replaceObject(values);
					}


					let tx = x1 + entity.position.x - entity.width  / 2;
					let ty = y1 + entity.position.y - entity.height / 2;

					element.style.width     = entity.width  + 'px';
					element.style.height    = entity.height + 'px';
					element.style.transform = 'translate(' + tx + 'px, ' + ty + 'px)';

					element._garbage = false;


					return true;

				}

			}


			return false;

		}

	};


	return Composite;

});

