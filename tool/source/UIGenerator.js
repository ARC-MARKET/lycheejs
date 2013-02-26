
lychee.define('tool.UIGenerator').tags({
	platform: 'html'
}).requires([
	'lychee.ui.Button',
	'lychee.ui.Text',
	'lychee.ui.Sprite'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global) {

	var Class = function() {

		this.__canvas = document.createElement('canvas');
		this.__context = this.__canvas.getContext('2d');

		lychee.event.Emitter.call(this, 'uigenerator');

	};


	Class.prototype = {

		defaults: {
			offset: { x: 0, y: 0 },
			width:  200,
			height: 200
		},

		export: function(rawsettings, rawrulesets) {

			this.settings = lychee.extend({}, this.defaults, rawsettings);


			var rulesets = lychee.extend({}, rawrulesets);
			var result = {};
			var queue = 0;
			for (var id in rulesets) {
				queue++;
			}


			for (var ruleId in rulesets) {

				this.__render(ruleId, rulesets[ruleId], function(id, svg, png) {

					result[id] = { svg: svg, png: png };
					queue--;


					if (queue === 0) {
						this.trigger('ready', [ result ]);
					}

				}, this);

			}

		},



		/*
		 * PRIVATE API
		 */

		__render: function(id, rules, callback, scope) {

			id = typeof id === 'string' ? id : 'default';

			var element = document.createElement('div');

			for (var property in rules) {
				element.style.setProperty(property, rules[property]);
			}

//			element.style.setProperty('width', '100%');
//			element.style.setProperty('height', '100%');
			element.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");


			var serialized = new XMLSerializer().serializeToString(element);

			var x      = this.settings.offset.x;
			var y      = this.settings.offset.y;
			var width  = this.settings.width;
			var height = this.settings.height;

			var tmp;
			if (rules.width !== undefined) {

				if (rules.width.match(/px/)) {
					width = parseInt(rules.width.replace(/px/,''), 10);
				} else if (rules.width.match(/%/)) {
					tmp = parseInt(rules.width.replace(/%/,''), 10) / 100;
					width = (tmp * width) | 0;
				}

				x = (this.settings.width - width) / 2;

			}

			if (rules.height !== undefined) {

				if (rules.height.match(/px/)) {
					height = parseInt(rules.height.replace(/px/,''), 10);
				} else if (rules.height.match(/%/)) {
					tmp = parseInt(rules.height.replace(/%/,''), 10) / 100;
					height = (tmp * height) | 0;
				}

				y = (this.settings.height - height) / 2;

			}


			this.__canvas.width = width;
			this.__canvas.height = height;


			var svgdata = "data:image/svg+xml," +
				"<svg xmlns='http://www.w3.org/2000/svg' width='" + this.settings.width + "' height='" + this.settings.height + "'>" +
					"<foreignObject width='100%' height='100%' x='" + x + "' y='" + y + "'>" +
					serialized +
					"</foreignObject>" +
				"</svg>";


			if (lychee.debug === true) {

				var copy = new Image();
				copy.src = svgdata;

				ui.Main.get('log').add(copy);

			}


			var png = null;
			var svg = new Image();
			svg.src = svgdata;


			var that = this;

			svg.onload = function() {

				that.__context.drawImage(svg, 0, 0);


				// Seriously, Chrome? Flagging svgdata images as unsecure canvas?
				// WTF is this shit?
				if (!window.navigator.userAgent.match(/Chrome/)) {

					var pngdata = that.__canvas.toDataURL('image/png');

					png = new Image();
					png.src = pngdata;

					png.onload = function() {
						callback.call(scope, id, svg, png);
					};

				} else {
					callback.call(scope, id, svg, png);
				}


			};

		}

	};


	return Class;

});
