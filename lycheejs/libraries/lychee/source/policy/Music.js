
lychee.define('lychee.policy.Music').exports((lychee, global, attachments) => {

	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.music = states.music instanceof Music ? states.music : null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let states = {
				music: null
			};


			return {
				'constructor': 'lychee.policy.Music',
				'arguments':   [ states ]
			};

		},



		/*
		 * CUSTOM API
		 */

		sensor: function() {

			let music  = this.music;
			let values = [ 0.5 ];


			if (music !== null) {

				let is_idle = music.isIdle;
				if (is_idle === true) {
					values[0] = 0;
				} else if (is_idle === false) {
					values[0] = 1;
				}

			}


			return values;

		},

		control: function(values) {

			let music = this.music;


			if (music !== null) {

				let is_idle = music.isIdle;
				if (is_idle === true && values[0] > 0.5) {
					music.play();
				} else if (is_idle === false && values[0] < 0.5) {
					music.stop();
				}

				return true;

			}


			return false;

		}

	};


	return Composite;

});

