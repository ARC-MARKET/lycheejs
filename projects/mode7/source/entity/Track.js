
lychee.define('game.entity.Track').exports(function(lychee, global, attachments) {

	var _TRACKS = {};

	for (var file in attachments) {

		var tmp = file.split('.');
		var id  = tmp[0];
		var ext = tmp[1];

		if (ext === 'json') {
			_TRACKS[id] = attachments[file].buffer;
		}

	}



	/*
	 * HELPERS
	 */

	var _parse_track = function(track, data) {

		if (data instanceof Object === false) {
			return;
		}


		var raw;


		for (var p = 0, pl = data.palette.length; p < pl; p++) {

			raw = data.palette[p];

			if (raw instanceof Object) {

				track.addPalette(
					raw.terrain,
					raw.road,
					raw.rumble,
					raw.lane
				);

			}

		}


		var lastaltitude = 0;

		for (var r = 0, rl = data.route.length; r < rl; r++) {

			var type     = data.route[r][0];
			var length   = data.route[r][1] || 1;
			var element  = data.route[r][2] || null;
			var altitude = data.route[r][3] * 20 || 0;


			switch(type) {

				case "straight":
					track.addRoute(length,   0, element, lastaltitude, altitude);
					lastaltitude = altitude;
					break;

				case "left-45":
					track.addRoute(length, -45, element, lastaltitude, altitude);
					lastaltitude = altitude;
					break;

				case "left-90":
					track.addRoute(length, -90, element, lastaltitude, altitude);
					lastaltitude = altitude;
					break;

				case "right-45":
					track.addRoute(length,  45, element, lastaltitude, altitude);
					lastaltitude = altitude;
					break;

				case "right-90":
					track.addRoute(length,  90, element, lastaltitude, altitude);
					lastaltitude = altitude;
					break;

				default:
					break;

			}

		}

	};

	var _render_segment = function(renderer, x1, y1, w1, x2, y2, w2, palette) {

		var lanes = 4;

		var r1 = w1 / Math.max(6,  2 * lanes);
		var r2 = w2 / Math.max(6,  2 * lanes);
		var l1 = w1 / Math.max(32, 8 * lanes);
		var l2 = w2 / Math.max(32, 8 * lanes);


		if (palette.terrain !== null) {

			var width = renderer.width;

			renderer.drawBox(
				0,
				y2,
				0  + width,
				y2 + (y1 - y2),
				palette.terrain,
				true
			);

		}


		if (palette.rumble !== null) {

			renderer.drawPolygon(
				4,
				x1 - w1 - r1, y1,
				x1 - w1,      y1,
				x2 - w2,      y2,
				x2 - w2 - r2, y2,
				palette.rumble,
				true
			);

			renderer.drawPolygon(
				4,
				x1 + w1 + r1, y1,
				x1 + w1,      y1,
				x2 + w2,      y2,
				x2 + w2 + r2, y2,
				palette.rumble,
				true
			);

		}

		if (palette.road !== null) {

			renderer.drawPolygon(
				4,
				x1 - w1, y1,
				x1 + w1, y1,
				x2 + w2, y2,
				x2 - w2, y2,
				palette.road,
				true
			);

		}

		if (palette.lane !== null) {

			var lw1 = w1 * 2 / lanes;
			var lw2 = w2 * 2 / lanes;
			var lx1 = x1 - w1 + lw1;
			var lx2 = x2 - w2 + lw2;

			for (var l = 1; l < lanes; lx1 += lw1, lx2 += lw2, l++) {

				renderer.drawPolygon(
					4,
					lx1 - l1/2, y1,
					lx1 + l1/2, y1,
					lx2 + l2/2, y2,
					lx2 - l2/2, y2,
					palette.lane,
					true
				);

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(id) {

		id = typeof id === 'string' ? id : 'valley';


		this.id         = id;
		this.length     = 0;

		this.__palette  = [];
		this.__round    = 0;
		this.__rounds   = Infinity;
		this.__rotation = 0;
		this.__segments = [];
		this.__type     = 'stadium';


		var data = _TRACKS[id] || _TRACKS['valley'] || null;
		if (data !== null) {
			_parse_track(this, data);
		}

	};


	Class.ELEMENTS = {

		jump: function(t, from, to) {
			return from + (to - from) * Math.pow(t ,2);
		},

		hill: function(t, from, to) {
			return from + (to - from) * ((-Math.cos(t * Math.PI)/2) + 0.5);
		}

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			return {
				'constructor': 'game.entity.Track',
				'arguments':   [ this.id ]
			};

		},

		render: function(renderer, offsetX, offsetY, camera, compositor) {

			var segments = this.__segments;

			if (camera !== null && compositor !== null) {

				var depth    = camera.depth;
				var position = camera.position;

				var current = this.getSegment(position.z);
				var from    = compositor.getPoint(0);
				var to      = compositor.getPoint(1);


				var x  = 0;
				var dx = -1 * (current.curviness * (position.z % 200) / 200) | 0;



				var length = this.length;
				var lasty  = renderer.height;
				var index  = current.index;
				for (var i = 0; i < 100; i++) {

					var segment = this.__segments[(index + i) % length];
					var offset  = segment.index < current.index ? (length * 200) : 0;

					compositor.project(
						from,
						segment.from,
						position.x - x,
						position.y,
						position.z - offset,
						depth
					);

					compositor.project(
						to,
						segment.to,
						position.x - x - dx,
						position.y,
						position.z - offset,
						depth
					);


					x  += dx;
					dx += segment.curviness;


					if (from.y >= lasty && to.y <= lasty) {

						_render_segment(
							renderer,
							from.x, from.y, from.w,
							to.x,   to.y,   to.w,
							segment.palette
						);

						lasty = to.y;

					}

				}

			}

		},



		/*
		 * CUSTOM API
		 */

		addPalette: function(terrain, road, rumble, lane) {

			terrain = typeof terrain === 'string' ? terrain : null;
			road    = typeof road === 'string'    ? road    : null;
			rumble  = typeof rumble === 'string'  ? rumble  : null;
			lane    = typeof lane === 'string'    ? lane    : null;


			this.__palette.push({
				terrain: terrain,
				road:    road,
				rumble:  rumble,
				lane:    lane
			});

			return true;

		},

		addRoute: function(length, curve, element, fromY, toY) {

			fromY = fromY || 0;
			toY   = toY || 0;

			var c = 0;
			if (curve !== 0) {
				c = ((curve / 90) * 100 / length) | 0;
			}


			var callback = null;
			if (element !== null) {
				callback = Class.ELEMENTS[element] || null;
			}


			var curviness = 0;
			var lastY     = fromY;
			var currentY  = 0;

			for (var s = 0; s < length; s++) {

				var rotation = this.__rotation + (curve / length);

				if (callback !== null) {
					currentY = callback.call(this, (s + 1) / length, fromY, toY) | 0;
				}


				this.addRouteSegment(
					curviness,
					rotation,
					lastY,
					currentY
				);

				curviness += c;
				lastY = currentY;

				this.__rotation = rotation;

			}

		},

		addRouteSegment: function(curviness, rotation, lastY, currentY) {

			curviness = typeof curviness === 'number' ? curviness : 0;
			rotation  = typeof rotation === 'number'  ? rotation  : 0;
			lastY     = typeof lastY === 'number'     ? lastY     : 0;
			currentY  = typeof currentY === 'number'  ? currentY  : lastY;


			var z       = this.length;
			var palette = this.__palette[((z / 3) | 0) % this.__palette.length];


			this.__segments.push({
				index:     z         | 0,
				rotation:  rotation  | 0,
				curviness: curviness | 0,
				from: {
					y: lastY,
					z: z * 200
				},
				to: {
					y: currentY,
					z: (z + 1) * 200
				},
				palette: palette
			});

			this.length++;

		},

		getSegment: function(position) {

			var length  = this.__segments.length;
			var z       = ((position / 200) | 0) % (length | 0);

			return this.__segments[z];

		}

	};


	return Class;

});

