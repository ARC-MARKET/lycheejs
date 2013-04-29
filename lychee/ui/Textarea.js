
lychee.define('lychee.ui.Textarea').requires([
	'lychee.Font'
]).includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	var _font = lychee.Font;


	var Class = function(data) {

		var settings = lychee.extend({}, data);

		this.__drag  = null;
		this.__font  = settings.font instanceof _font ? settings.font : null;
		this.__value = '';


		this.setValue(settings.value);


		delete settings.value;
		delete settings.font;


		settings.width  = typeof settings.width === 'number'  ? settings.width  : 64 * 4;
		settings.height = typeof settings.height === 'number' ? settings.height : 64;
		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;

		lychee.ui.Entity.call(this, 'ui-textarea', settings);


		/*
		 * INITIALIZATION
		 */

		this.bind('focus', function() {
			this.setState('active');
		}, this);

		this.bind('blur', function() {
			this.setState('default');
		}, this);


		this.bind('key', function(key, name, delta) {

			var line      = this.__lines[this.__lines.length - 1];
			var character = key;

			if (key === 'return') {

				this.__lines.push('');

			} else {

				if (key === 'space') {
					character = ' ';
				} else if (key === 'tab') {
					character = '\t';
				}

				if (character.length === 1) {
					line += character;
				} else if (key === 'backspace') {
					line = line.substr(0, line.length - 1);
				}

				this.__lines[this.__lines.length - 1] = line;

			}

console.log(this.__lines);

		}, this);


		settings = null;

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		getDrag: function() {
			return this.__drag;
		},

		getFont: function() {
			return this.__font;
		},

		getLines: function() {
			return this.__lines;
		},

		getOffset: function(line) {

			line = typeof line === 'number' ? line : null;

			if (line !== null && this.__lines[line] !== undefined) {

				var lineheight = 0;
				if (this.__font !== null) {
					lineheight = this.__font.getSettings().lineheight;
				}

				var offset = line * lineheight;


				return offset;

			}


			return 0;

		},

		getText: function(line) {

			line = typeof line === 'number' ? line : null;

			if (line !== null && this.__lines[line] !== undefined) {
				return this.__lines[line];
			}


			return this.__lines.join('\n');

		},

		getValue: function() {
			return this.__lines.join('\n');
		},

		setValue: function(value) {

			value = typeof value === 'string' ? value : '';

			this.__lines = value.split('\n');


			return true;

		}

	};


	return Class;

});

