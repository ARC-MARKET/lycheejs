
lychee.define('ui.Textarea').includes([
	'lychee.event.Emitter'
]).tags({
	platform: 'html'
}).exports(function(lychee, global) {

	var Class = function(value, callback, scope) {

		callback = callback instanceof Function ? callback : function(){};
		scope = scope !== undefined ? scope : global;

		var that = this;


		this.__element = document.createElement('textarea');
		this.__element.onblur = function() {
			callback.call(scope, that.__element.value);
		};


		this.__element.onselect = function() {

			that.trigger('select', [
				that.__element.selectionStart,
				that.__element.selectionEnd
			]);

		};

		this.__element.onkeydown = function(event) {

			if (event.keyCode === 9) {
				that.__element.value += '\t';
				return false;
			}

		};

		lychee.event.Emitter.call(this, 'textarea');

		this.set(value);

	};


	Class.prototype = {

		addTo: function(element) {

			if (element instanceof HTMLElement) {
				element.appendChild(this.__element);
			}

		},

		get: function() {
			return this.__element.value || '';
		},

		set: function(value) {

			value = typeof value === 'string' ? value : null;

			if (value !== null) {

				this.__element.value = value;
				return true;

			}


			return false;

		},

		scrollTo: function(line) {

			line = typeof line === 'number' ? line : 0;

			var style = global.getComputedStyle(this.__element, null);
			var lineHeight = parseInt(style.getPropertyValue('line-height').replace(/px/,''), 10);

			if (isNaN(lineHeight)) {
				lineHeight = parseInt(style.getPropertyValue('font-size').replace(/px/,''), 10);
			}

			if (!isNaN(lineHeight)) {
				this.__element.scrollTop = line * lineHeight;
			}

			return true;

		}

	};


	return Class;

});

