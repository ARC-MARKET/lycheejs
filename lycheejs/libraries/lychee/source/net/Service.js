
lychee.define('lychee.net.Service').includes([
	'lychee.event.Emitter'
]).exports((lychee, global, attachments) => {

	let   _id       = 0;
	const _Emitter  = lychee.import('lychee.event.Emitter');
	const _SERVICES = {};
	let   _Tunnel   = null;



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

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.id     = 'lychee-net-Service-' + _id++;
		this.tunnel = null;

		this.__multicast = [];


		// XXX: Circular Dependency Problem
		if (_Tunnel === null) {
			_Tunnel = lychee.import('lychee.net.Tunnel');
		}


		this.setId(states.id);
		this.setTunnel(states.tunnel);


		_Emitter.call(this);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.Service';

			let states = (data['arguments'][0] || {});
			let blob   = (data['blob'] || {});


			if (this.id !== null) states.id = this.id;


			let tunnel = this.tunnel;
			if (tunnel !== null) {

				if (tunnel.type === 'client') {
					states.tunnel = '#MAIN.client';
				} else {
					states.tunnel = null;
				}

			}


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * SERVICE API
		 */

		multicast: function(data, service) {

			data    = data instanceof Object    ? data    : null;
			service = service instanceof Object ? service : null;


			let tunnel = this.tunnel;
			if (tunnel !== null && data !== null) {

				let type = tunnel.type;
				if (type === 'client') {

					if (service !== null) {

						if (typeof service.id !== 'string') {
							service.id = this.id;
						}

					} else if (service === null) {

						service = {
							id:    this.id,
							event: 'multicast'
						};

					}


					tunnel.send({
						data:    data,
						service: service
					}, {
						id:     this.id,
						method: 'multicast'
					});


					return true;

				} else if (type === 'remote') {

					// Allow method calls from remote side
					if (data !== null && service !== null) {

						data = {
							data:    data,
							service: service
						};

					}


					if (data.service !== null) {

						for (let m = 0, ml = this.__multicast.length; m < ml; m++) {

							let other = this.__multicast[m];
							if (other !== this.tunnel) {

								data.data.tid = this.tunnel.id;

								other.send(
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

		broadcast: function(data, service) {

			data    = data instanceof Object    ? data    : null;
			service = service instanceof Object ? service : null;


			let tunnel = this.tunnel;
			if (tunnel !== null && data !== null) {

				let type = tunnel.type;
				if (type === 'client') {

					if (service !== null) {

						if (typeof service.id !== 'string') {
							service.id = this.id;
						}

					} else {

						service = {
							id:    this.id,
							event: 'broadcast'
						};

					}

					tunnel.send({
						data:    data,
						service: service
					}, {
						id:     this.id,
						method: 'broadcast'
					});


					return true;

				} else if (type === 'remote') {

					// XXX: Allow method calls from remote side
					if (data !== null && service !== null) {

						data = {
							data:    data,
							service: service
						};

					}


					if (data.service !== null) {

						let broadcast = _SERVICES[this.id] || null;
						if (broadcast !== null) {

							for (let b = 0, bl = broadcast.length; b < bl; b++) {

								let other = broadcast[b].tunnel;
								if (other !== this.tunnel) {

									data.data.tid = this.tunnel.id;

									other.send(
										data.data,
										data.service
									);

								}

							}

							return true;

						}

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

					return true;

				}

			}


			return false;

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

					return true;

				}

			}


			return false;

		},

		send: function(data, service) {

			data    = data instanceof Object    ? data    : null;
			service = service instanceof Object ? service : null;


			let tunnel = this.tunnel;
			if (tunnel !== null && data !== null) {

				if (service !== null) {

					if (typeof service.id !== 'string') {
						service.id = this.id;
					}

					let result = tunnel.send(data, service);
					if (result === true) {
						return true;
					}

				} else {

					let result = tunnel.send(data);
					if (result === true) {
						return true;
					}

				}

			}


			return false;

		},

		setId: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				this.id = id;

				return true;

			}


			return false;

		},

		setMulticast: function(multicast) {

			multicast = multicast instanceof Array ? multicast : null;


			if (multicast !== null) {

				this.__multicast = multicast.filter(instance => lychee.interfaceof(_Tunnel, instance));

				return true;

			}


			return false;

		},

		setTunnel: function(tunnel) {

			tunnel = lychee.interfaceof(_Tunnel, tunnel) ? tunnel : null;


			if (tunnel !== null) {

				if (this.tunnel !== null) {

					if (tunnel.type === 'client') {

						if (this.has('plug', _plug_broadcast, this) === true) {
							this.unbind('plug', _plug_broadcast, this);
						}

						if (this.has('unplug', _unplug_broadcast, this) === true) {
							this.unbind('unplug', _unplug_broadcast, this);
						}

					} else if (tunnel.type === 'remote') {

						if (this.has('plug', _plug_broadcast, this) === false) {
							this.bind('plug', _plug_broadcast, this);
						}

						if (this.has('unplug', _unplug_broadcast, this) === false) {
							this.bind('unplug', _unplug_broadcast, this);
						}

					}

				}

				this.tunnel = tunnel;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

