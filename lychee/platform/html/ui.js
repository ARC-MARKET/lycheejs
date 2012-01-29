
ly.ui = function(element, content, func, scope) {

	if (element instanceof HTMLElement) {
		this.element = element;
	} else if (typeof element === 'string') {
		this.element = document.createElement(element);
	} else {
		this.element = null;
	}

	if (typeof content === 'string') {
		this.element.innerHTML = content;
	}

	if (func !== undefined) {

		func = typeof func === 'function' ? func : function() {};
		scope = scope || window;

		this.element.onclick = function(event) {
			func.call(scope);
			event.preventDefault();
			event.stopPropagation();
		};

	}

};

ly.ui.prototype = {

	clear: function() {
		if (this.element !== null) {
			this.element.innerHTML = '';
		}
	},

	set: function(html) {
		if (this.element !== null) {
			this.element.innerHTML = html.toString();
		}
	},

	add: function(element) {
		if (this.element !== null) {
			if (element instanceof HTMLElement) {
				this.element.appendChild(element);
			} else if (element.element instanceof HTMLElement) {
				this.element.appendChild(element.element);
			}
		}
	},

	addTo: function(element) {
		if (this.element !== null) {
			if (element instanceof HTMLElement) {
				element.appendChild(this.element);
			} else if (element.element instanceof HTMLElement) {
				element.element.appendChild(this.element);
			}
		}
	},

	hide: function() {
		if (this.element !== null && !this.element.className.match(/hidden/)) {
			this.element.className += ' hidden';
		}
	},

	show: function() {
		if (this.element !== null && this.element.className.match(/hidden/)) {

			var classNames = this.element.className.split(' '),
				newClassNames = [];
			for (var c = 0, l = classNames.length; c < l; c++) {
				if (classNames[c] !== 'hidden') {
					newClassNames.push(classNames[c]);
				}
			}

			this.element.className = newClassNames.join(' ');

			classNames = null;
			newClassNames = null;

		}
	},

	destroy: function() {
		if (this.element !== null && this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
		}
	}

};



/*
 * Button
 */
ly.ui.button = function(desc, func, scope) {

	func = func || function() {};
	scope = scope || window;

	var element = document.createElement('button');
	element.innerHTML = desc;

	element.onclick = function() {
		func.call(scope);
	};

	return new ly.ui(element);

};



/*
 * Checkbox
 */
ly.ui.checkbox = function(state, func, scope) {

	state = state === true ? true : false;
	func = func || function() {};
	scope = scope || window;

	var element = document.createElement('div');

	if (state === true) {
		element.className = 'ly-checkbox active';
	} else {
		element.className = 'ly-checkbox';
	}

	element.onclick = function() {

		var value = false;
		if (this.className === 'ly-checkbox') {
			value = true;
			this.className = 'ly-checkbox active';
		} else {
			value = false;
			this.className = 'ly-checkbox';
		}

		func.call(scope, value);

	};


	var control = new ly.ui(element);
	control.set = function(value) {
		if (value === true) {
			this.element.className = 'ly-checkbox active';
		} else {
			this.element.className = 'ly-checkbox';
		}
	};

	return control;

};



/*
 * Input
 */
ly.ui.input = function(type, value, func, scope) {

	func = func || function() {};
	scope = scope || window;

	var element = document.createElement('input');

	if (type === 'number') {

		element.type = 'number';
		element.value = value;

		var oldValue = value;
		element.onblur = function() {
			var newValue = parseInt(this.value, 10);
			if (isNaN(newValue)) {
				this.value = oldValue;
			} else {
				var retValue = func.call(scope, newValue);
				if (retValue !== newValue && typeof retValue === 'number') {
					oldValue = retValue;
					this.value = oldValue;
				} else if (retValue === false) {
					this.value = oldValue;
				} else {
					oldValue = this.value;
				}
			}
		};

	} else {

		element.type = 'text';
		element.value = value;

		var oldValue = value;
		element.onblur = function() {
			var retValue = func.call(scope, this.value);
			if (retValue !== this.value && typeof retValue === 'string') {
				oldValue = retValue;
				this.value = oldValue;
			} else if (retValue === false) {
				this.value = oldValue;
			} else {
				oldValue = this.value;
			}
		};

	}


	var control = new ly.ui(element);
	control.set = function(value) {
		oldValue = value;
		this.element.value = value;
	};
	control.get = function() {
		if (this.element !== null) {
			return this.element.value;
		}
		return null;
	};

	return control;

};

/*
 * Select
 */
ly.ui.select = function(func, scope) {

	func = func || function() {};
	scope = scope || window;

	var element = document.createElement('select');

	if (func !== null) {

		element.onchange = function() {

			var value = this.options[this.selectedIndex].value,
				retValue = func.call(scope, value);

			if (retValue !== value) {
				for (var o = 0, l = this.options.length; o < l; o++) {
					var option = this.options[o];
					if (option.value === retValue) {
						option.setAttribute('selected', 'selected');
					} else {
						option.removeAttribute('selected');
					}
				}
			}

		};

	}


	var control = new ly.ui(element);
	control.get = function() {
		var index = this.element.selectedIndex;
		if (index > 0) {
			return this.element.options[index].value;
		} else if (this.element.value !== undefined) {
			return this.element.value;
		}

		return null;
	};
	control.set = function(value) {
		var options = this.element.options,
			oldIndex = this.element.selectedIndex,
			oldOption = null;

		if (oldIndex > 0) {
			oldOption = options[oldIndex];
		}

		if (oldOption === null || oldOption.value !== value) {

			for (var o = 0, l = options.length; o < l; o++) {
				var newOption = options[o];
				if (newOption.value === value) {
					if (oldOption !== null) {
						oldOption.removeAttribute('selected');
					}
					newOption.setAttribute('selected', 'selected');
					this.element.selectedIndex = o;
				}
			}

		}
	};

	return control;

};



/*
 * Select > Option
 */
ly.ui.option = function(desc, value) {

	var element = document.createElement('option');
	element.value = value;
	element.innerHTML = desc;

	return new ly.ui(element);

};



/*
 * Radio(s)
 */
ly.ui.radios = function(values, active, func, scope) {

	if (Object.prototype.toString.call(values) !== '[object Array]') {
		values = [ values ];
	}

	active = typeof active === 'string' ? active : values[0];
	func = func || function() {};
	scope = scope || window;

	var control = {
		elements: [],
		__active: null,
		__values: [],
		__func: func,
		__scope: scope
	};

	for (var v = 0, l = values.length; v < l; v++) {

		var element = document.createElement('div'),
			value = values[v];

		if (active === value) {
			control.__active = v;
			element.className = 'ly-radio active';
		} else {
			element.className = 'ly-radio';
		}

		control.elements.push(new ly.ui(element));
		control.__values.push(value);

		(function(value) {
			element.onclick = function() {
				control.set(value);
			};
		})(value);

	}

	control.set = function(value) {

		var newActive = null;
		for (var i = 0, il = this.elements.length; i < il; i++) {

			if (this.__values[i] === value) {

				if (this.__active !== null) {
					if (this.__active === i) {
						break;
					}
					this.elements[this.__active].element.className = 'ly-radio';
				}


				newActive = i;
				this.elements[i].element.className = 'ly-radio active';

			}

		}

		if (newActive !== null) {
			this.__active = newActive;
			this.__func.call(this.__scope, this.__values[newActive]);
			return true;
		}

		return false;

	};


	return control;

};



/*
 * Lightboxes
 */
ly.ui.lightbox = function(id, title) {

	id = id !== undefined ? id : null;
	title = title !== undefined ? title : null;

	var lightbox = document.createElement('div');
	if (id !== null) {
		lightbox.id = id;
	}
	lightbox.className = 'ly-lightbox hidden';

	var header = document.createElement('header');
	lightbox.appendChild(header);

	var article = document.createElement('article');
	lightbox.appendChild(article);

	var span = document.createElement('span');
	span.innerHTML = title === null ? '...' : title;
	header.appendChild(span);

	var control = new ly.ui(lightbox);
	control.__title = span;
	control.__content = article;

	var button = new ly.ui.button('X', function() {
		this.hide();
	}, control);
	button.element.className = 'ly-lightbox-close';
	header.appendChild(button.element);

	control.title = function(title) {
		title = title !== undefined ? title : '...';
		this.__title.innerHTML = title;
	};

	control.add = function(content) {

		if (content.element instanceof HTMLElement) {
			content = content.element;
		}

		if (typeof content === 'string') {
			this.__content.innerHTML += content;
		} else if (content instanceof HTMLElement) {
			this.__content.appendChild(content);
		}

	};

	return control;

};

