
lychee.define('lychee.net.client.Session').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _id = 0;



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(id, client, data) {

		id = typeof id === 'string' ? id : 'session';


		var settings = Object.assign({}, data);


		this.admin     = false;
		this.autoadmin = true;
		this.autolock  = true;
		this.autostart = true;
		this.sid       = 'session-' + _id++;
		this.tid       = null;
		this.min       = 2;
		this.max       = 4;


		this.setAutoadmin(settings.autoadmin);
		this.setAutolock(settings.autolock);
		this.setAutostart(settings.autostart);
		this.setSid(settings.sid);
		this.setMin(settings.min);
		this.setMax(settings.max);

		delete settings.autolock;
		delete settings.autostart;
		delete settings.sid;
		delete settings.min;
		delete settings.max;


		lychee.net.Service.call(this, id, client, lychee.net.Service.TYPE.client);



		/*
		 * INITIALIZATION
		 */

		this.bind('sync', function(data) {

			var type = data.type;
			if (type === 'update') {

				this.admin = data.admin;
				this.sid   = data.sid;
				this.min   = data.min;
				this.max   = data.max;

			}


			if (type === 'update' || type === 'start' || type === 'stop') {

				delete data.type;

				this.trigger(type, [ data ]);

			}

		}, this);


		if (lychee.debug === true) {

			this.bind('error', function(error) {
				console.error('lychee.net.client.Session: ' + error.message);
			}, this);

		}


		settings = null;

	};


	Composite.prototype = {

		/*
		 * CUSTOM API
		 */

		join: function() {

			if (this.sid !== null) {

				if (this.tunnel !== null) {

					if (lychee.debug === true) {
						console.log('lychee.net.client.Session: Joining session "' + this.sid + '"');
					}


					this.tunnel.send({
						autoadmin: this.autoadmin,
						autolock:  this.autolock,
						autostart: this.autostart,
						sid:       this.sid,
						min:       this.min,
						max:       this.max
					}, {
						id:    this.id,
						event: 'join'
					});

				}

			}

		},

		start: function() {

			if (this.sid !== null) {

				if (this.tunnel !== null) {

					this.tunnel.send({
						sid: this.sid
					}, {
						id:    this.id,
						event: 'start'
					});

				}

			}

		},

		stop: function() {

			if (this.sid !== null) {

				if (this.tunnel !== null) {

					this.tunnel.send({
						sid: this.sid
					}, {
						id:    this.id,
						event: 'stop'
					});

				}

			}

		},

		leave: function() {

			if (this.sid !== null) {

				if (this.tunnel !== null) {

					if (lychee.debug === true) {
						console.log('lychee.net.client.Session: Leaving session "' + this.sid + '"');
					}


					this.tunnel.send({
						sid:   this.sid
					}, {
						id:    this.id,
						event: 'leave'
					});

				}

			}

		},

		setAutoadmin: function(autoadmin) {

			if (autoadmin === true || autoadmin === false) {

				this.autoadmin = autoadmin;

				return true;

			}


			return false;

		},

		setAutolock: function(autolock) {

			if (autolock === true || autolock === false) {

				this.autolock = autolock;

				return true;

			}


			return false;

		},

		setAutostart: function(autostart) {

			if (autostart === true || autostart === false) {

				this.autostart = autostart;

				return true;

			}


			return false;

		},

		setSid: function(sid) {

			sid = typeof sid === 'string' ? sid : null;


			if (sid !== null) {

				this.sid = sid;

				return true;

			}


			return false;

		},

		setMax: function(max) {

			max = typeof max === 'number' ? max : null;


			if (max !== null) {

				this.max = max;

				return true;

			}


			return false;

		},

		setMin: function(min) {

			min = typeof min === 'number' ? min : null;


			if (min !== null) {

				this.min = min;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

