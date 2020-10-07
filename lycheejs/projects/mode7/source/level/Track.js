
lychee.define('game.level.Track').exports((lychee, global, attachments) => {

	const _TRACKS = {
		circuit:  attachments['circuit.json'],
		straight: attachments['straight.json'],
		valley:   attachments['valley.json']
	};



	/*
	 * HELPERS
	 */

	const _add_route = function(length, curve, element, fromY, toY) {

		fromY = fromY || 0;
		toY   = toY   || 0;

		let c = 0;
		if (curve !== 0) {
			c = ((curve / 90) * 100 / length) | 0;
		}


		let callback = null;
		if (element !== null) {
			callback = Composite.ELEMENTS[element] || null;
		}


		let curviness = 0;
		let lastY     = fromY;
		let currentY  = 0;

		for (let s = 0; s < length; s++) {

			let rotation = this.__rotation + (curve / length);

			if (callback !== null) {
				currentY = callback.call(this, (s + 1) / length, fromY, toY) | 0;
			}


			_add_route_segment.call(
				this,
				curviness,
				rotation,
				lastY,
				currentY
			);

			curviness += c;
			lastY = currentY;

			this.__rotation = rotation;

		}

	};

	const _add_route_segment = function(curviness, rotation, lastY, currentY) {

		curviness = typeof curviness === 'number' ? curviness : 0;
		rotation  = typeof rotation === 'number'  ? rotation  : 0;
		lastY     = typeof lastY === 'number'     ? lastY     : 0;
		currentY  = typeof currentY === 'number'  ? currentY  : lastY;


		let z       = this.length;
		let palette = this.__palette[((z / 3) | 0) % this.__palette.length];


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

	};

	const _parse_track = function(data) {

		for (let p = 0, pl = data.palette.length; p < pl; p++) {

			let raw = data.palette[p];
			if (raw instanceof Object) {

				this.addPalette(
					raw.terrain,
					raw.road,
					raw.rumble,
					raw.lane
				);

			}

		}


		let lastaltitude = 0;

		for (let r = 0, rl = data.route.length; r < rl; r++) {

			let type     = data.route[r][0];
			let length   = data.route[r][1] || 1;
			let element  = data.route[r][2] || null;
			let altitude = data.route[r][3] * 20 || 0;


			switch (type) {

				case 'straight':
					_add_route.call(this, length,   0, element, lastaltitude, altitude);
					lastaltitude = altitude;
					break;

				case 'left-45':
					_add_route.call(this, length, -45, element, lastaltitude, altitude);
					lastaltitude = altitude;
					break;

				case 'left-90':
					_add_route.call(this, length, -90, element, lastaltitude, altitude);
					lastaltitude = altitude;
					break;

				case 'right-45':
					_add_route.call(this, length,  45, element, lastaltitude, altitude);
					lastaltitude = altitude;
					break;

				case 'right-90':
					_add_route.call(this, length,  90, element, lastaltitude, altitude);
					lastaltitude = altitude;
					break;

				default:
					break;

			}

		}

	};

	const _render_segment = function(renderer, x1, y1, w1, x2, y2, w2, palette) {

		let lanes = 4;

		let r1 = w1 / Math.max(6,  2 * lanes);
		let r2 = w2 / Math.max(6,  2 * lanes);
		let l1 = w1 / Math.max(32, 8 * lanes);
		let l2 = w2 / Math.max(32, 8 * lanes);


		if (palette.terrain !== null) {

			let width = renderer.width;

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

			let lw1 = w1 * 2 / lanes;
			let lw2 = w2 * 2 / lanes;
			let lx1 = x1 - w1 + lw1;
			let lx2 = x2 - w2 + lw2;

			for (let l = 1; l < lanes; lx1 += lw1, lx2 += lw2, l++) {

				renderer.drawPolygon(
					4,
					lx1 - l1 / 2, y1,
					lx1 + l1 / 2, y1,
					lx2 + l2 / 2, y2,
					lx2 - l2 / 2, y2,
					palette.lane,
					true
				);

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.id         = typeof states.id === 'string' ? states.id : 'circuit';
		this.length     = 0;

		this.__palette  = [];
		this.__round    = 0;
		this.__rounds   = Infinity;
		this.__rotation = 0;
		this.__segments = [];
		this.__type     = 'stadium';


		_parse_track.call(this, (_TRACKS[this.id] || _TRACKS.circuit).buffer);

		states = null;

	};


	Composite.ELEMENTS = {

		jump: function(t, from, to) {
			return from + (to - from) * Math.pow(t, 2);
		},

		hill: function(t, from, to) {
			return from + (to - from) * ((-Math.cos(t * Math.PI) / 2) + 0.5);
		}

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let states = {};


			if (this.id !== 'circuit') states.id = this.id;


			return {
				'constructor': 'game.level.Track',
				'arguments':   [ states ]
			};

		},

		render: function(renderer, offsetX, offsetY, camera, compositor) {

			if (camera !== null && compositor !== null) {

				let depth    = camera.depth;
				let position = camera.position;

				let current = this.getSegment(position.z);
				let from    = compositor.getPoint(0);
				let to      = compositor.getPoint(1);


				let x  = 0;
				let dx = -1 * (current.curviness * (position.z % 200) / 200) | 0;



				let length = this.length;
				let lasty  = renderer.height;
				let index  = current.index;
				for (let i = 0; i < 100; i++) {

					let segment = this.__segments[(index + i) % length];
					let offset  = segment.index < current.index ? (length * 200) : 0;

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

		getSegment: function(position) {

			position = typeof position === 'number' ? position : 0;


			let length  = this.__segments.length;
			let z       = ((position / 200) | 0) % (length | 0);

			return this.__segments[z];

		}

	};


	return Composite;

});

