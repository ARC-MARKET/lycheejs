
lychee.define('app.net.Client').includes([
	'lychee.net.Client'
]).exports((lychee, global, attachments) => {

	const _Client = lychee.import('lychee.net.Client');
	const _CONFIG = attachments['json'].buffer;
	const _ROOMS  = [
		'node1',
		'fgb',
		'node0',
		'sm',
		'node3',
		'crewlock',
		'destiny',
		'harmony',
		'columbus',
		'jem'
	];
	const _SENSORS = {
		destiny: {
			pressure:    'USLAB000058',
			temperature: 'USLAB000059',
			n2:          'USLAB000054',
			co2:         'USLAB000053'
		},
		crewlock: {
			pressure: 'AIRLOCK000054'
		},
		harmony: {
			water: 'NODE2000006'
		},
		tranquility: {
			water:'NODE3000013'
		}
	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({
			reconnect: 10000
		}, data);


		_Client.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', _ => {

			if (lychee.debug === true) {
				console.log('app.net.Client: Remote connected');
			}

		}, this);

		this.bind('disconnect', code => {

			if (lychee.debug === true) {
				console.log('app.net.Client: Remote disconnected (' + code + ')');
			}

		}, this);


		this.connect();


		setInterval(_ => {

			Object.keys(_SENSORS).forEach(room => {

				Object.keys(_SENSORS[room]).forEach(sensor => {

					let value = '' + (Math.random() * 100).toFixed(2);
					this.trigger('sensor', [ room, sensor, value ]);

				});

			});

		}, 5000);

		setTimeout(_ => {

			let _id = 0;
			let _ACTIVITIES = [ 'sleep', 'sleep', 'science', 'sleep', 'sleep', 'science' ];

			_CONFIG.forEach(data => {

				_id++;
				_id = _id % 6;

				data.room = _ROOMS[_id];

				if (data.activities && data.activities.length > 0) {
					data.activity = _ACTIVITIES[_id];
				}

				this.trigger('astronaut', [ data ]);

			});

		}, 2000);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Client.prototype.serialize.call(this);
			data['constructor'] = 'app.net.Client';


			return data;

		}

	};


	return Composite;

});

