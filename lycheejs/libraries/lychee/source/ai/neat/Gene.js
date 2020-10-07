
lychee.define('lychee.ai.neat.Gene').exports((lychee, global, attachments) => {

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.enabled     = true;
		this.innovation  = 0;
		this.into        = null;
		this.out         = null;
		this.weight      = 0.0;


		this.setEnabled(states.enabled);
		this.setInnovation(states.innovation);
		this.setInto(states.into);
		this.setOut(states.out);
		this.setWeight(states.weight);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'lychee.ai.neat.Gene',
				'arguments':   []
			};

		},



		/*
		 * CUSTOM API
		 */

		setEnabled: function(enabled) {

			enabled = typeof enabled === 'boolean' ? enabled : null;


			if (enabled !== null) {

				this.enabled = enabled;

				return true;

			}


			return false;

		},

		setInnovation: function(innovation) {

			innovation = typeof innovation === 'number' ? (innovation | 0) : null;


			if (innovation !== null) {

				this.innovation = innovation;

				return true;

			}


			return false;

		},

		setInto: function(into) {

			into = typeof into === 'number' ? into : null;


			if (into !== null) {

				this.into = into;

				return true;

			}


			return false;

		},

		setOut: function(out) {

			out = typeof out === 'number' ? out : null;


			if (out !== null) {

				this.out = out;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

