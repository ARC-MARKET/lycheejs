
lychee.define('lychee.policy.Music').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.music = settings.music instanceof Music ? settings.music : null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let settings = {
				music: null
			};


			return {
				'constructor': 'lychee.policy.Music',
				'arguments':   [ settings ]
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

			}

		}

	};


	return Composite;

});

