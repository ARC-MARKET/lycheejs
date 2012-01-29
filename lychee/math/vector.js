
ly.vector = function(elements) {

	if (Object.prototype.toString.call(elements) !== '[object Array]') {
		throw 'ly.vector needs an Array';
	}


	this.elements = elements;

};

ly.vector.PRECISION = 0.000001;

ly.vector.prototype = {

	/*
	 * HELPERS
	 */
	isVector: function(vector) {

		if (vector instanceof ly.vector) {
			return true;
		}

		return false;

	},

	isVectorOfSameDimensions(vector) {

		if (
			vector instanceof ly.vector
			&& this.elements.length === vector.elements.length
		) {
			return true;
		}

		return false;

	},

	each: function(callback) {
		for (var e = 0, l = this.elements.length; e < l; e++) {
			callback(this.elements[e], e);
		}
	},

	map: function(callback) {

		var elements = [];

		this.each(function(x, i) {
			elements.push(callback(x, i));
		});

		return new ly.vector(elements);

	},

	copy: function() {
		return new ly.vector(this.elements);
	},


	/*
	 * MATHS
	 */
	add: function(vector) {

		if (this.isVectorOfSameDimensions(vector) === true) {
			return this.map(function(x, i) {
				return x + vector.elements[i];
			});
		}

		return null;

	},

	substract: function(vector) {

		if (this.isVectorOfSameDimensions(vector) === true) {
			return this.map(function(x, i) {
				return x - vector.elements[i];
			});
		}

		return null;

	},

	multiply: function(k) {

		if (typeof k === 'number') {
			return this.map(function(x) {
				return x * k;
			});
		}

		return null;

	},

	dot: function(vector) {

		if (this.isVectorOfSameDimensions(vector) === true) {

			var product = 0;
			this.each(function(x, i) {
				product += (x * vector.elements[i]);
			});

			return product;

		}

		return null;

	},

	cross: function(vector) {

		if (
			this.elements.length === 3
			&& this.isVectorOfSameDimensions(vector) === true
		) {

			var A = this.elements,
				B = vector.elements;

			return new ly.vector([
				(A[1] * B[2]) - (A[2] * B[1]),
				(A[2] * B[0]) - (A[0] * B[2]),
				(A[0] * B[1]) - (A[1] * B[0])
			]);

		}

		return null;

	},

	max: function() {

		var m = 0;
		this.each(function(x, i) {
			m = Math.max(Math.abs(x), m);
		});

		return m;

	},

	round: function() {
		return this.map(function(x) {
			return Math.round(x);
		});
	},

	dimensions: function() {
		return this.elements.length;
	},

	modulus: function() {
		return Math.sqrt(this.dot(this));
	},

	angleTo: function(vector) {

		if (this.isVectorOfSameDimensions(vector) === true) {

			var dot = this.dot(vector);

			var mod1 = 0,
				mod2 = 0;

			this.each(function(x, i) {
				mod1 += x * x;
				mod2 += vector.elements[i] * vector.elements[i];
			});

			mod1 = Math.sqrt(mod1);
			mod2 = Math.sqrt(mod2);

			// Vectors are parallel to each other
			if (mod1 * mod2 === 0) {
				return null;
			}

			var theta = dot / (mod1 * mod2);

			theta = Math.max(theta, -1);
			theta = Math.min(theta,  1);


			return Math.acos(theta);

		}

		return null;

	},

	// TODO: object should be a ly.point of instead being kindof everything allowed.
	distanceTo: function(object) {

		if (
			object instanceof ly.line
			|| object instanceof ly.plane
		) {
			return object.distanceTo(this);
		}

		if (
			(object.dimensions instanceof Function && this.dimensions() === object.dimensions())
			|| (Object.prototype.toString.call(object) === '[object Array]' && this.dimensions() === object.length)
		) {

			// Allows object being an Array
			var B = object.elements || object;

			var sum = 0;
			this.each(function(x, i) {
				sum += Math.pow(x - B[i], 2);
			});

			return Math.sqrt(sum);

		}

		return null;

	},

	snapTo: function(snap) {
		return this.map(function(x) {
			return (Math.abs(x - snap) <= ly.vector.PRECISION) ? snap : x;
		});
	},

	isAntiParallelTo: function(vector) {

		if (this.isVectorOfSameDimensions(vector) === true) {

			var angle = this.angleTo(vector);
			if (angle !== null) {

				if (Math.abs(angle - Math.PI) <= ly.vector.PRECISION) {
					return true;
				}

				return false;

			}

		}

		return null;

	},

	isEqualTo: function(vector) {

		if (this.isVectorOfSameDimensions(vector) === true) {

			this.each(function(x, i) {
				if (Math.abs(x - vector.elements[i]) > ly.vector.PRECISION) {
					return false;
				}
			});

			return true;

		}

		return null;

	},

	isOrthogonalTo: function(vector) {

		if (this.isVectorOfSameDimensions(vector) === true) {
			var dot = this.dot(vector);
			return (Math.abs(dot) <= ly.vector.PRECISION);
		}

	},

	isParallelTo: function(vector) {

		if (this.isVectorOfSameDimensions(vector) === true) {

			var angle = this.angleTo(vector);
			if (angle !== null) {

				if (angle <= ly.vector.PRECISION) {
					return true;
				}

				return false;

			}

		}

		return null;

	}

};

