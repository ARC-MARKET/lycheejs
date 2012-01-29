
ly.matrix = function(elements) {

	if (Object.prototype.toString.call(elements) !== '[object Array]') {
		throw 'ly.vector needs an Array';
	}


	this.elements = elements;

};

ly.matrix.PRECISION = 0.000001;

ly.matrix.prototype = {

	/*
	 * HELPERS
	 */

	isMatrix: function(matrix) {

		if (matrix instanceof ly.matrix) {
			return true;
		}

		return false;

	},

	isMatrixOfSameDimensions(matrix) {

		if (
			matrix instanceof ly.matrix
			&& this.elements.length === matrix.elements.length
			&& this.elements[0].length === matrix.elements[0].length
		) {
			return true;
		}

		return false;

	},

	dimensions: function() {

		return {
			rows: this.elements.length,
			cols: this.elements[0].length
		};

	},

	each: function(callback) {

		for (var r = 0, rl = this.elements.length; r < rl; r++) {
			for (var c = 0, cl = this.elements[r].length; c < cl; c++) {
				callback(this.elements[r][c], r, c);
			}
		}

	},

	map: function(callback) {

		var elements = [];

		// this.elements[row][column]
		for (var r = 0, rl = this.elements.length; r < rl; r++) {

			elements[r] = [];

			for (var c = 0, cl = this.elements[r].length; c < cl; c++) {
				elements[r][c] = callback(this.elements[r][c], r, c);
			}

		}

		return new ly.matrix(elements);

	},

	copy: function() {
		return new ly.matrix(this.elements);
	},

	/*
	 * MATHS
	 */
	add: function(matrix) {

		if (this.isMatrixOfSameDimensions(matrix)) {
			return this.map(function(x, i, j) {
				return x + matrix.elements[i][j];
			});
		}

		return null;

	},

	substract: function(matrix) {

		if (this.isMatrixOfSameDimensions(matrix)) {
			return this.map(function(x, i, j) {
				return x - matrix.elements[i][j];
			});
		}

		return null;

	},

	toDiagonal: function() {

		if (this.isSquare() === false) {
			return null;
		}

		var elements = [];
		for (var i = 0, l = this.elements.length; i < l; i++) {
			elements.push(this.elements[i][i]);
		}

		return new ly.vector(elements);

	},

	max: function() {

		var m = 0;
		this.each(function(x, r, c) {
			m = Math.max(Math.abs(x), m);
		});

		return m;

	},

	round: function() {
		return this.map(function(x) {
			return Math.round(x);
		});
	},

	trace: function() {

		if (this.isSquare() === false) {
			return null;
		}

		var m = 0;
		for (var i = 0, l = this.elements.length; i < l; i++) {
			m += this.elements[i][i];
		}

		return m;

	},

	transpose: function() {

		var elements = [];

		for (var i = 0, rows = this.elements.length; i < rows; i++) {

			elements[i] = [];

			for (var j = 0, cols = this.elements[0].length; j < cols; j++) {
				elements[i][j] = this.elements[j][i];
			}

		}

		return new ly.matrix(elements);

	},

	snapTo: function(snap) {
		return this.map(function(x) {
			return (Math.abs(x - snap) <= ly.matrix.PRECISION) ? snap : x;
		});
	},

	isSquare: function() {
		return this.elements.length === this.elements[0].length;
	}

};

