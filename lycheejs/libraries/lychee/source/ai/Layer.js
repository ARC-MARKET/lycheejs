
lychee.define('lychee.ai.Layer').requires([
	'lychee.ai.Agent'
]).includes([
	'lychee.event.Emitter'
]).exports((lychee, global, attachments) => {

	const _Agent   = lychee.import('lychee.ai.Agent');
	const _Emitter = lychee.import('lychee.event.Emitter');



	/*
	 * HELPERS
	 */

	const _validate_agent = function(agent) {

		if (agent instanceof Object) {

			if (
				typeof agent.update === 'function'
				&& typeof agent.crossover === 'function'
				&& typeof agent.fitness === 'number'
				&& typeof agent.reward === 'function'
				&& typeof agent.punish === 'function'
			) {
				return true;
			}

		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		// XXX: Keep Layer API compatibility
		this.width    = 0;
		this.height   = 0;
		this.depth    = 0;
		this.radius   = 0;
		this.alpha    = 1;
		this.entities = [];
		this.position = { x: 0, y: 0, z: 0 };
		this.shape    = 1;
		this.visible  = true;


		this.agents = [];

		this.__map = {};


		this.setAgents(states.agents);


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
			data['constructor'] = 'lychee.ai.Layer';

			let states = {};
			let blob   = (data['blob'] || {});


			if (this.agents.length > 0) {
				blob.agents = this.agents.map(lychee.serialize);
			}

			if (blob.agents instanceof Array && Object.keys(this.__map).length > 0) {

				blob.map = Object.map(this.__map, function(val, key) {

					let index = this.agents.indexOf(val);
					if (index !== -1) {
						return index;
					}


					return undefined;

				}, this);

			}


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {
			// XXX: Do nothing
		},

		update: function(clock, delta) {

			let agents   = this.agents;
			let is_alive = false;

			for (let a = 0, al = agents.length; a < al; a++) {

				let agent = agents[a];
				if (agent.alive === true) {
					agent.update(clock, delta);
					is_alive = true;
				}

			}


			if (is_alive === false) {
				this.trigger('epoche');
			}

		},



		/*
		 * CUSTOM API
		 */

		collides: function(agent) {

			agent = lychee.interfaceof(_Agent, agent) ? agent : null;


			if (agent !== null) {
				// XXX: AI Agents cannot collide
			}


			return false;

		},

		confines: function(position) {

			position = position instanceof Object ? position : null;


			if (position !== null) {
				// XXX: AI Layers cannot confine space
			}


			return false;

		},

		query: function(query) {

			query = typeof query === 'string' ? query : null;


			if (query !== null) {

				let tmp    = query.split(' > ');
				let aid    = tmp.shift().trim();
				let entity = this.getAgent(aid);
				if (entity !== null) {

					if (tmp.length > 0) {

						if (typeof entity.query === 'function') {
							return entity.query(tmp.join(' > ').trim());
						} else {

							if (lychee.debug === true) {
								console.warn('lychee.app.Layer: Invalid query "' + tmp.join(' > ') + '" on entity "' + aid + '".');
							}

						}

					} else {
						return entity;
					}

				}

			}


			return null;

		},

		trace: function(position) {

			position = position instanceof Object ? position : null;


			if (position !== null) {
				// XXX: AI Layers cannot trace
			}


			return null;

		},

		addAgent: function(agent) {

			agent = _validate_agent(agent) === true ? agent : null;


			if (agent !== null) {

				let index = this.agents.indexOf(agent);
				if (index === -1) {

					this.agents.push(agent);


					return true;

				}

			}


			return false;

		},

		setAgent: function(id, agent) {

			id    = typeof id === 'string'          ? id    : null;
			agent = _validate_agent(agent) === true ? agent : null;


			if (id !== null && agent !== null && this.__map[id] === undefined) {

				this.__map[id] = agent;

				let result = this.addAgent(agent);
				if (result === true) {
					return true;
				} else {
					delete this.__map[id];
				}

			}


			return false;

		},

		getAgent: function(id) {

			id = typeof id === 'string' ? id : null;


			let found = null;


			if (id !== null) {

				let num = parseInt(id, 10);

				if (this.__map[id] !== undefined) {
					found = this.__map[id];
				} else if (isNaN(num) === false) {
					found = this.agents[num] || null;
				}

			}


			return found;

		},

		removeAgent: function(agent) {

			agent = _validate_agent(agent) === true ? agent : null;


			if (agent !== null) {

				let found = false;

				let index = this.agents.indexOf(agent);
				if (index !== -1) {

					this.agents.splice(index, 1);
					found = true;

				}


				for (let id in this.__map) {

					if (this.__map[id] === agent) {

						delete this.__map[id];
						found = true;

					}

				}


				return found;

			}


			return false;

		},

		setAgents: function(agents) {

			agents = agents instanceof Array ? agents : null;


			let all = true;

			if (agents !== null) {

				for (let a = 0, al = agents.length; a < al; a++) {

					let result = this.addAgent(agents[a]);
					if (result === false) {
						all = false;
					}

				}

			}


			return all;

		},

		removeAgents: function() {

			let agents = this.agents;

			for (let a = 0, al = agents.length; a < al; a++) {

				this.removeAgent(agents[a]);

				al--;
				a--;

			}

			return true;

		},

		setPosition: function(position) {

			position = position instanceof Object ? position : null;


			if (position !== null) {

				this.position.x = typeof position.x === 'number' ? position.x : this.position.x;
				this.position.y = typeof position.y === 'number' ? position.y : this.position.y;
				this.position.z = typeof position.z === 'number' ? position.z : this.position.z;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

