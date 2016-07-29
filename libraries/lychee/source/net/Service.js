
lychee.define('lychee.net.Service').requires([
	// 'lychee.net.Tunnel' // XXX: Causes circular dependency
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	const _Emitter  = lychee.import('lychee.event.Emitter');
	const _SERVICES = [];



	/*
	 * HELPERS
	 */

	const _plug_broadcast = function() {

		let id = this.id;
		if (id !== null) {

			let cache = _SERVICES[id] || null;
			if (cache === null) {
				cache = _SERVICES[id] = [];
			}


			let found = false;

			for (let c = 0, cl = cache.length; c < cl; c++) {

				if (cache[c] === this) {
					found = true;
					break;
				}

			}


			if (found === false) {
				cache.push(this);
			}

		}

	};

	const _unplug_broadcast = function() {

		this.setMulticast([]);


		let id = this.id;
		if (id !== null) {

			let cache = _SERVICES[id] || null;
			if (cache !== null) {

				for (let c = 0, cl = cache.length; c < cl; c++) {

					if (cache[c] === this) {
						cache.splice(c, 1);
						break;
					}

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(id, tunnel, type) {

		id     = typeof id === 'string'                        ? id     : null;
		tunnel = lychee.interfaceof(lychee.net.Tunnel, tunnel) ? tunnel : null;
		type   = lychee.enumof(Composite.TYPE, type)           ? type   : null;


		this.id     = id;
		this.tunnel = tunnel;
		this.type   = type;

		this.__multicast = [];


		if (lychee.debug === true) {

			if (this.id === null) {
				console.error('lychee.net.Service: Invalid (string) id. It has to be kept in sync with the lychee.net.Client and lychee.net.Remote instance.');
			}

			if (this.tunnel === null) {
				console.error('lychee.net.Service: Invalid (lychee.net.Tunnel) tunnel.');
			}

			if (this.type === null) {
				console.error('lychee.net.Service: Invalid (lychee.net.Service.TYPE) type.');
			}

		}


		_Emitter.call(this);



		/*
		 * INITIALIZATION
		 */

		if (this.type === Composite.TYPE.remote) {

			this.bind('plug',   _plug_broadcast,   this);
			this.bind('unplug', _unplug_broadcast, this);

		}

	};


	Composite.TYPE = {
		// 'default': 0, (deactivated)
		'client': 1,
		'remote': 2
	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.Service';

			let id     = null;
			let tunnel = null;
			let type   = null;
			let blob   = (data['blob'] || {});


			if (this.id !== null)   id   = this.id;
			if (this.type !== null) type = this.type;

			if (this.type === Composite.TYPE.client) {
				tunnel = '#MAIN.client';
			} else {
				tunnel = null;
			}


			data['arguments'][0] = id;
			data['arguments'][1] = tunnel;
			data['arguments'][2] = type;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * SERVICE API
		 */

		multicast: function(data, service) {

			data    = data instanceof Object    ? data    : null;
			service = service instanceof Object ? service : null;


			if (data === null) {
				return false;
			}


			let type = this.type;
			if (type === Composite.TYPE.client) {

				if (service === null) {

					service = {
						id:    this.id,
						event: 'multicast'
					};

				}


				if (this.tunnel !== null) {

					this.tunnel.send({
						data:    data,
						service: service
					}, {
						id:     this.id,
						method: 'multicast'
					});

					return true;

				}

			} else if (type === Composite.TYPE.remote) {

				if (data.service !== null) {

					for (let m = 0, ml = this.__multicast.length; m < ml; m++) {

						let tunnel = this.__multicast[m];
						if (tunnel !== this.tunnel) {

							data.data.tid = this.tunnel.host + ':' + this.tunnel.port;

							tunnel.send(
								data.data,
								data.service
							);

						}

					}

					return true;

				}

			}


			return false;

		},

		broadcast: function(data, service) {

			data    = data instanceof Object    ? data    : null;
			service = service instanceof Object ? service : null;


			if (data === null || this.id === null) {
				return false;
			}


			let type = this.type;
			if (type === Composite.TYPE.client) {

				if (service === null) {

					service = {
						id:    this.id,
						event: 'broadcast'
					};

				}


				if (this.tunnel !== null) {

					this.tunnel.send({
						data:    data,
						service: service
					}, {
						id:     this.id,
						method: 'broadcast'
					});

					return true;

				}

			} else if (type === Composite.TYPE.remote) {

				if (data.service !== null) {

					let broadcast = _SERVICES[this.id] || null;
					if (broadcast !== null) {

						for (let b = 0, bl = broadcast.length; b < bl; b++) {

							let tunnel = broadcast[b].tunnel;
							if (tunnel !== this.tunnel) {

								data.data.tid = this.tunnel.host + ':' + this.tunnel.port;

								tunnel.send(
									data.data,
									data.service
								);

							}

						}

						return true;

					}

				}

			}


			return false;

		},

		accept: function(message, blob) {

			message = typeof message === 'string' ? message : null;
			blob    = blob instanceof Object      ? blob    : null;


			if (message !== null) {

				let tunnel = this.tunnel;
				if (tunnel !== null) {

					tunnel.send({
						message: message,
						blob:    blob
					}, {
						id:    this.id,
						event: 'success'
					});

				}

			}

		},

		reject: function(message, blob) {

			message = typeof message === 'string' ? message : null;
			blob    = blob instanceof Object      ? blob    : null;


			if (message !== null) {

				let tunnel = this.tunnel;
				if (tunnel !== null) {

					tunnel.send({
						message: message,
						blob:    blob
					}, {
						id:    this.id,
						event: 'error'
					});

				}

			}

		},

		setMulticast: function(multicast) {

			multicast = multicast instanceof Array ? multicast : null;


			if (multicast !== null) {

				this.__multicast = multicast.filter(function(instance) {
					return lychee.interfaceof(lychee.net.Tunnel, instance);
				});

				return true;

			}


			return false;

		}

	};


	return Composite;

});

