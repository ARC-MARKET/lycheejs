
lychee.define('lychee.ai.Layer').requires([
	'lychee.ai.Agent',
	'lychee.ai.bnn.Agent',
	'lychee.ai.enn.Agent',
	'lychee.ai.neat.Agent'
//	'lychee.ai.bneat.Agent',
//	'lychee.ai.hyperneat.Agent'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	const _Agent   = lychee.import('lychee.ai.Agent');
	const _Emitter = lychee.import('lychee.event.Emitter');
	const _agent   = {
		ENN:       lychee.import('lychee.ai.enn.Agent'),
		BNN:       lychee.import('lychee.ai.bnn.Agent'),
		NEAT:      lychee.import('lychee.ai.neat.Agent'),
		BNEAT:     lychee.import('lychee.ai.bneat.Agent'),
		HYPERNEAT: lychee.import('lychee.ai.hyperneat.Agent')
	};



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

	const _create_agent = function() {

		let Agent = _Agent;
		let type  = this.type;
		if (type === Composite.TYPE.CUSTOM) {

			let template = lychee.serialize(this.agents[0]);
			if (template !== null) {
				Agent = lychee.import(template['constructor']);
			}

		} else if (type === Composite.TYPE.ENN) {
			Agent = _agent.ENN;
		} else if (type === Composite.TYPE.BNN) {
			Agent = _agent.BNN;
		} else if (type === Composite.TYPE.NEAT) {
			Agent = _agent.NEAT;
		} else if (type === Composite.TYPE.BNEAT) {
			Agent = _agent.BNEAT;
		} else if (type === Composite.TYPE.HYPERNEAT) {
			Agent = _agent.HYPERNEAT;
		}


		return new Agent();

	};


	const _on_epoche = function() {

		let agents  = this.agents;
		let fitness = this.__fitness;


		fitness.total   = 0;
		fitness.average = 0;
		fitness.best    = -Infinity;
		fitness.worst   = Infinity;

		for (let a = 0, al = agents.length; a < al; a++) {

			let agent = agents[a];

			fitness.total += agent.fitness;
			fitness.best   = Math.max(fitness.best,  agent.fitness);
			fitness.worst  = Math.min(fitness.worst, agent.fitness);

		}


		// Worst Case: All Agents are retards
		if (fitness.total !== 0) {
			fitness.average = fitness.total / agents.length;
		} else {
			return;
		}


		let old_a      = 0;
		let new_agents = [];
		let old_agents = agents.slice(0).sort(function(a, b) {
			if (a.fitness > b.fitness) return -1;
			if (a.fitness < b.fitness) return  1;
			return 0;
		});


		if (old_agents.length > 8) {

			let partition = Math.round(0.2 * old_agents.length);
			if (partition % 2 === 1) {
				partition++;
			}


			// Survivor Population
			for (let p = 0; p < partition; p++) {
				new_agents.push(old_agents[p]);
				old_a++;
			}


			// Mutant Population
			for (let p = 0; p < partition; p++) {

				let agent = _create_agent.call(this);

				agent.brain.setSensors(old_agents[old_a].brain.sensors);
				agent.brain.setControls(old_agents[old_a].brain.controls);

				new_agents.push(agent);
				old_a++;

			}


			// Breed Population
			let b       = 0;
			let b_tries = 0;

			while (new_agents.length < old_agents.length) {

				let agent_mum = old_agents[b];
				let agent_dad = old_agents[b + 1];
				let children  = agent_mum.crossover(agent_dad);

				if (children !== null) {

					let agent_sis = children[0];
					let agent_bro = children[1];

					if (new_agents.indexOf(agent_sis) === -1) {

						agent_sis.brain.setSensors(old_agents[old_a].brain.sensors);
						agent_sis.brain.setControls(old_agents[old_a].brain.controls);

						new_agents.push(agent_sis);
						old_a++;

					}

					if (new_agents.indexOf(agent_bro) === -1) {

						agent_bro.brain.setSensors(old_agents[old_a].brain.sensors);
						agent_bro.brain.setControls(old_agents[old_a].brain.controls);

						new_agents.push(agent_bro);
						old_a++;

					}

				}


				b += 1;
				b %= partition;

				b_tries++;


				// XXX: Not enough Agents for healthy Evolution
				if (b_tries > old_agents.length) {
					break;
				}

			}

		}


		if (new_agents.length < old_agents.length) {

			if (lychee.debug === true) {
				console.warn('lychee.ai.Layer: Not enough Agents for healthy Evolution');
			}

			let diff = old_agents.length - new_agents.length;

			for (let o = 0; o < old_agents.length; o++) {

				let old_agent = old_agents[o];
				if (new_agents.indexOf(old_agent) === -1) {

					let other = old_agents[old_a];
					if (other !== old_agent) {
						old_agent.brain.setSensors(other.brain.sensors);
						old_agent.brain.setControls(other.brain.controls);
					}

					old_agent.fitness = 0;

					new_agents.push(old_agent);
					old_a++;
					diff--;

				}


				if (diff === 0) {
					break;
				}

			}

		}


		// XXX: Don't break references
		for (let n = 0, nl = new_agents.length; n < nl; n++) {
			this.agents[n] = new_agents[n];
			this.agents[n].alive = true;
		}


		new_agents = null;
		old_agents = null;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		// XXX: Keep Layer API compatibility
		this.width    = 0;
		this.height   = 0;
		this.depth    = 0;
		this.radius   = 0;
		this.alpha    = 1;
		this.entities = [];
		this.position = { x: 0, y: 0, z: 0 };
		this.visible  = true;


		this.agents = [];
		this.type   = Composite.TYPE.CUSTOM;

		this.__fitness = {
			total:    0,
			average:  0,
			best:    -Infinity,
			worst:    Infinity
		};
		this.__map     = {};


		this.setAgents(settings.agents);

		if (lychee.enumof(Composite.TYPE, settings.type) && this.type !== settings.type) {
			this.setType(settings.type);
		} else {
			this.trigger('epoche');
		}


		_Emitter.call(this);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('epoche', _on_epoche, this);

	};


	Composite.TYPE = {
		CUSTOM:    0,
		ENN:       1,
		BNN:       2,
		NEAT:      3,
		BNEAT:     4,
		HYPERNEAT: 5
	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ai.Layer';

			let settings = {};
			let blob     = (data['blob'] || {});


			if (this.type !== Composite.TYPE.ENN) settings.type = this.type;


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


			data['arguments'][0] = settings;
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

			if (position instanceof Object) {

				this.position.x = typeof position.x === 'number' ? position.x : this.position.x;
				this.position.y = typeof position.y === 'number' ? position.y : this.position.y;
				this.position.z = typeof position.z === 'number' ? position.z : this.position.z;

				return true;

			}


			return false;

		},

		setType: function(type) {

			type = lychee.enumof(Composite.TYPE, type) ? type : null;


			if (type !== null) {

				let oldtype = this.type;
				if (oldtype !== type) {

					this.type = type;
					this.trigger('epoche');

					return true;

				}

			}


			return false;

		}

	};


	return Composite;

});

