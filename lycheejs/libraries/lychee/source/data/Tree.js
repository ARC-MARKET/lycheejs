
lychee.define('lychee.data.Tree').exports((lychee, global, attachments) => {

	/*
	 * HELPERS
	 */

	const _validate_entity = function(entity) {

		if (entity instanceof Object) {
			return true;
		}


		return false;

	};

	const _traverse_filter = function(callback, scope) {

		let filtered = [];
		let queue    = [ this.__root ];

		while (queue.length > 0) {

			let node = queue.shift();

			if (callback.call(scope, node) === true) {
				filtered.push(node);
			}

			for (let c = 0, cl = node.children.length; c < cl; c++) {
				queue.push(node.children[c]);
			}

		}

		return filtered;

	};

	const _traverse_find = function(callback, scope) {

		let found = null;
		let queue = [ this.__root ];

		while (queue.length > 0) {

			let node = queue.shift();

			if (callback.call(scope, node) === true) {
				found = node;
				break;
			}

			for (let c = 0, cl = node.children.length; c < cl; c++) {
				queue.push(node.children[c]);
			}

		}

		return found;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.length = 0;

		this.__root = {
			entity:   null,
			children: []
		};


		this.setEntities(states.entities);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.entities instanceof Object && blob.map instanceof Object) {

				let cache = {};

				for (let id in blob.entities) {

					let entity = lychee.deserialize(blob.entities[id]);
					if (entity !== null) {

						let pid = blob.map[id] || -1;
						if (pid >= 0) {
							this.addEntity(entity, cache[pid] || null);
						} else {
							this.addEntity(entity);
						}

						cache[id] = entity;

					}

				}

			}

		},

		serialize: function() {

			let blob = {};


			let root = this.__root;
			if (root.children.length > 0) {

				blob.entities = {};
				blob.map      = {};

				let cache = [];
				let count = 0;
				let queue = [ this.__root ];

				while (queue.length > 0) {

					let node = queue.shift();

					blob.entities[cache.length] = lychee.serialize(node.entity);
					cache.push(node.entity);

					for (let c = 0, cl = node.children.length; c < cl; c++) {
						queue.push(node.children[c]);
						blob.map[count++] = cache.indexOf(node.entity);
					}

				}

			}


			return {
				'constructor': 'lychee.data.Tree',
				'arguments':   [],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		filter: function(callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			let filtered = [];

			if (callback !== null) {
				_traverse_filter.call(this, filtered, callback, scope);
			}

			return filtered;

		},

		find: function(callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (callback !== null) {
				return _traverse_find.call(this, callback, scope);
			}


			return null;

		},

		addEntity: function(entity, parent) {

			entity = _validate_entity(entity) === true ? entity : null;
			parent = _validate_entity(parent) === true ? parent : null;


			if (entity !== null) {

				let node = this.__root;

				if (parent !== null) {
					node = this.find(other => other.entity === parent);
				}


				let found = node.children.find(other => other.entity === entity);
				if (found === null) {

					node.children.push({
						entity:   entity,
						children: []
					});

					this.length++;

				}


				return true;


			}


			return false;

		},

		removeEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {

				let queue = [ this.__root ];

				while (queue.length > 0) {

					let node = queue.shift();

					for (let c = 0, cl = node.children.length; c < cl; c++) {

						if (node.children[c].entity === entity) {

							node.children.splice(c, 1);
							this.length--;
							cl--;
							c--;

						} else {

							queue.push(node.children[c]);

						}

					}

				}


				return true;

			}


			return false;

		},

		setEntities: function(entities) {

			entities = entities instanceof Array ? entities : null;


			let all = true;

			if (entities !== null) {

				for (let e = 0, el = entities.length; e < el; e++) {

					let result = this.addEntity(entities[e]);
					if (result === false) {
						all = false;
					}

				}

			}

			return all;

		},

		removeEntities: function() {

			let root = this.__root;

			if (root.children.length > 0) {

				delete root.children;
				root.children = [];

			}

			return true;

		}

	};


	return Composite;

});

