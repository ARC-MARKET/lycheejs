
lychee.define('lychee.ai.Genome').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.genes = [];

		this.__map = {};


		this.setGenes(settings.genes);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.genes instanceof Array) {

				let genes = blob.genes;
				let map   = {};


				if (blob.map instanceof Object) {

					for (let bid in blob.map) {

						let index = blob.map[bid];
						if (typeof index === 'number') {
							map[bid] = index;
						}

					}

				}


				for (let g = 0, gl = genes.length; g < gl; g++) {

					let id = null;
					for (let mid in map) {

						if (map[mid] === g) {
							id = mid;
						}

					}


					if (id !== null) {
						this.setGene(id, genes[g]);
					} else {
						this.addGene(genes[g]);
					}

				}

			}

		},

		serialize: function() {

			let blob = {};


			if (this.genes.length > 0) {
				blob.genes = this.genes.map(lychee.serialize);
			}


			if (blob.genes instanceof Array && Object.keys(this.__map).length > 0) {

				blob.map = Object.map(this.__map, function(val, key) {

					let index = this.genes.indexOf(val);
					if (index !== -1) {
						return index;
					}


					return undefined;

				}, this);

			}


			return {
				'constructor': 'lychee.ai.Genome',
				'arguments':   [],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		addGene: function(gene) {

			gene = gene instanceof Object ? gene : null;


			if (gene !== null) {

				let index = this.genes.indexOf(gene);
				if (index === -1) {

					this.genes.push(gene);

					return true;

				}

			}


			return false;

		},

		setGene: function(id, gene) {

			id   = typeof id === 'string' ? id   : null;
			gene = gene instanceof Object ? gene : null;


			if (id !== null && gene !== null && this.__map[id] === undefined) {

				this.__map[id] = gene;

				let result = this.addGene(gene);
				if (result === true) {
					return true;
				} else {
					delete this.__map[id];
				}

			}


			return false;

		},

		getGene: function(id) {

			id = typeof id === 'string' ? id : null;


			let found = null;


			if (id !== null) {

				if (this.__map[id] !== undefined) {
					found = this.__map[id];
				}

			}


			return found;

		},

		removeGene: function(gene) {

			gene = gene instanceof Object ? gene : null;


			if (gene !== null) {

				let found = false;

				let index = this.genes.indexOf(gene);
				if (index !== -1) {
					this.genes.splice(index, 1);
					found = true;
				}


				for (let id in this.__map) {

					if (this.__map[id] === gene) {

						delete this.__map[id];
						found = true;

					}

				}


				return found;

			}


			return false;

		},

		setGenes: function(genes) {

			genes = genes instanceof Object ? genes : null;


			let all = true;

			if (genes !== null) {

				for (let g = 0, gl = genes.length; g < gl; g++) {

					let result = this.addGene(genes[g]);
					if (result === false) {
						all = false;
					}

				}

			}


			return all;

		},

		removeGenes: function() {

			let genes = this.genes;

			for (let g = 0, gl = genes.length; g < gl; g++) {

				this.removeGene(genes[g]);

				gl--;
				g--;

			}

			return true;

		}

	};


	return Composite;

});

