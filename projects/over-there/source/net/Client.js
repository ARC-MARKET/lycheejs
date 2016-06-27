
lychee.define('app.net.Client').requires([
]).includes([
	'lychee.net.Client'
]).exports(function(lychee, global, attachments) {

	var _Client  = lychee.import('lychee.net.Client');
	var _CONFIG  = attachments["json"].buffer;
	var _ROOMS   = ['node1', 'fgb', 'node0', 'sm', 'node3', 'crewlock', 'destiny', 'harmony', 'columbus', 'jem'];
	var _SENSORS = {
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

	var Class = function(data) {

		var settings = Object.assign({
			reconnect: 10000
		}, data);

		var _timelineManager = null;
		var _pushPage        = null;

		_Client.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function() {

			if (lychee.debug === true) {
				console.log('app.net.Client: Remote connected');
			}

		}, this);

		this.bind('disconnect', function(code) {

			if (lychee.debug === true) {
				console.log('app.net.Client: Remote disconnected (' + code + ')');
			}

		}, this);


		this.connect();



		var that = this;

		setInterval(function() {

			Object.keys(_SENSORS).forEach(function(room) {

				Object.keys(_SENSORS[room]).forEach(function(sensor) {

					var value = '' + (Math.random() * 100).toFixed(2);
					that.trigger('sensor', [ room, sensor, value ]);

				});

			});

		}, 5000);


		setTimeout(function() {

			var _id = 0;
			var _ACTIVITIES = ['sleep', 'sleep', 'science', 'sleep', 'sleep', 'science'];

			_CONFIG.forEach(function(data) {

				_id++;
				_id = _id % 6;

				data.room = _ROOMS[_id];

				if (data.activities && data.activities.length > 0) {
					data.activity = _ACTIVITIES[_id];
				}

				that.trigger('astronaut', [ data ]);

			});

		}, 2000);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Client.prototype.serialize.call(this);
			data['constructor'] = 'app.net.Client';


			return data;

		}

	};


	return Class;

});

