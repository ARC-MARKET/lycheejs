
lychee.define('lychee.ai.enn.Layer').requires([
	'lychee.ai.enn.Agent'
]).includes([
	'lychee.ai.Layer'
]).exports((lychee, global, attachments) => {

	const _Agent = lychee.import('lychee.ai.enn.Agent');
	const _Layer = lychee.import('lychee.ai.Layer');



	/*
	 * HELPERS
	 */

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
		let old_agents = agents.slice(0).sort((a, b) => {
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

				let agent = new _Agent();

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

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.__fitness = {
			total:    0,
			average:  0,
			best:    -Infinity,
			worst:    Infinity
		};


		_Layer.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('epoche', _on_epoche, this);

	};


	Composite.prototype = {

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ai.enn.Layer';

			let states = {};
			let blob   = (data['blob'] || {});


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		}

	};


	return Composite;

});

