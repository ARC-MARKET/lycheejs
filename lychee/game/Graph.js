
lychee.define('lychee.game.Graph').exports(function(lychee, global) {

	var _Node = function(entity, parent) {

		entity = entity !== null ? entity : null;
		parent = parent !== null ? parent : null;

		this.entity = entity;
		this.parent = parent;
		this.children = [];

	};

	_Node.prototype = {

		setParent: function(node) {

			if (node instanceof _Node || node === null) {
				this.parent = node;
			}

		},

		addChild: function(node) {

			// Search our children
			var found = false;
			for (var c = 0, l = this.children.length; c < l; c++) {

				if (this.children[c] === node) {
					found = true;
					break;
				}

			}


			if (found === false) {

				// Unlink old parent
				if (node.parent !== null) {
					node.parent.removeChild(node);
				}

				// Set new parent and add child
				node.setParent(this);
				this.children.push(node);

			}

		},

		removeChild: function(node) {

			// Search our children
			var found = false;
			for (var c = 0, l = this.children.length; c < l; c++) {

				if (this.children[c] === node) {
					found = true;
					this.children.splice(c, 1);
					l--;
				}

			}


			// Unlink old parent
			if (found === true) {
				node.setParent(null);
			}

		}

	};


	var Class = function() {

		this.__dirty  = false;
		this.__tree   = new _Node(null, null);
		this.__offset = { x: 0, y: 0, z: 0 };

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		reset: function(clearTree) {

			clearTree = clearTree === true;


			this.__dirty  = false;
			this.__offset = { x: 0, y: 0, z: 0 };

			if (clearTree === true) {
				this.__tree = new _Node(null, null);
			}

		},

		add: function(entity, parent) {

			entity = entity !== null ? entity : null;
			parent = parent instanceof _Node ? parent : null;


			var node = this.__getNodeByEntity(entity);
			if (node === null) {

				node = new _Node(entity, parent);

				if (parent === null) {
					this.__tree.addChild(node);
					this.__dirty = true;
				}

			}

			if (parent !== null) {
				parent.addChild(node);
				this.__dirty = true;
			}


			return node;

		},

		remove: function(node) {

			if (!node instanceof _Node) {
				node = this.__getNodeByEntity(entity);
			}


			if (node !== null) {

				if (node.parent !== null) {
					node.parent.removeChild(node);
				}

				return true;

			}


			return false;

		},

		update: function(clock, delta) {

			this.__updateNode(this.__tree, clock, delta);

		},

		getEntityByPosition: function(x, y, z) {

			x = typeof x === 'number' ? x : null;
			y = typeof y === 'number' ? y : null;
			z = typeof z === 'number' ? z : null;


			var found = this.__getNodeByPosition(x, y, z);
			if (found !== null) {
				return found.entity;
			}


			return null;

		},

		getOffset: function() {
			return this.__offset;
		},

		setOffset: function(offset) {

			if (Object.prototype.toString.call(offset) !== '[object Object]') {
				return false;
			}

			this.__offset.x = typeof offset.x === 'number' ? offset.x : this.__offset.x;
			this.__offset.y = typeof offset.y === 'number' ? offset.y : this.__offset.y;
			this.__offset.z = typeof offset.z === 'number' ? offset.z : this.__offset.z;

			return true;

		},



		/*
		 * PRIVATE API
		 */

		__updateNode: function(node, clock, delta) {

			if (node.entity !== null) {
				node.entity.update(clock, delta);
			}


			for (var c = 0, l = node.children.length; c < l; c++) {
				this.__updateNode(node.children[c], clock, delta);
			}

		},

		__getNodeByEntity: function(entity, node) {

			if (entity === null) return null;

			if (node == null) {
				node = this.__tree;
			}


			var found = null;

			if (node.entity !== null && node.entity === entity) {
				found = node;
			}


			for (var c = 0, l = node.children.length; c < l; c++) {
				found = this.__getNodeByEntity(entity, node.children[c]);
				if (found !== null) break;
			}


			return found;

		},

		__getNodeByPosition: function(x, y, z, node, posX, posY, posZ) {

			if (node == null) {
				node = this.__tree;
				posX = 0;
				posY = 0;
				posZ = 0;
			}

			var found = null;

			if (node.entity !== null) {

				var position = node.entity.getPosition();
				var hwidth   = (node.entity.width  / 2) || node.entity.radius || 0;
				var hheight  = (node.entity.height / 2) || node.entity.radius || 0;
				var hdepth   = (node.entity.depth  / 2) || node.entity.radius || 0;


				posX += position.x;
				posY += position.y;
				posZ += position.z;


				if (
					(x === null || (x >= posX - hwidth && x <= posX + hwidth))
					&& (y === null || (y >= posY - hheight && y <= posY + hheight))
					&& (z === null || (z >= posZ - hdepth && y <= posZ + hdepth))
				) {

					found = node;

				}

			}


			for (var c = 0, l = node.children.length; c < l; c++) {
				var foundchild = this.__getNodeByPosition(x, y, z, node.children[c], posX, posY, posZ);
				if (foundchild !== null) found = foundchild;
			}


			return found;

		}

	};


	return Class;

});

