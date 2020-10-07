
lychee.define('lychee.Stash').tags({
	platform: 'nidium'
}).requires([
	'lychee.Asset'
]).includes([
	'lychee.event.Emitter'
]).supports((lychee, global) => {

	if (typeof global.File === 'function') {
		return true;
	}


	return false;

}).exports((lychee, global, attachments) => {

	let   _id         = 0;
	const _Asset      = lychee.import('lychee.Asset');
	const _Emitter    = lychee.import('lychee.event.Emitter');
	const _File       = global.File || null;
	const _PERSISTENT = {
		data: {},
		read: function() {
			return null;
		},
		write: function(id, asset) {
			return false;
		}
	};
	const _TEMPORARY  = {
		data: {},
		read: function() {

			if (Object.keys(this.data).length > 0) {
				return this.data;
			}


			return null;

		},
		write: function(id, asset) {

			if (asset !== null) {
				this.data[id] = asset;
			} else {
				delete this.data[id];
			}

			return true;

		}
	};



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		if (_File === null) {
			return;
		}

		const _ENCODING = {
			'Config':  'utf8',
			'Font':    'utf8',
			'Music':   'binary',
			'Sound':   'binary',
			'Texture': 'binary',
			'Stuff':   'utf8'
		};

		const _to_arraybuffer = function(buffer) {

			let bytes = new Uint8Array(buffer.length);

			for (let b = 0, bl = buffer.length; b < bl; b++) {
				bytes[b] = buffer[b];
			}

			return bytes.buffer;

		};


		let rm    = 'rm' in _File.prototype;
		let write = 'writeSync' in _File.prototype;

		if (rm === true && write === true) {

			_PERSISTENT.write = function(id, asset) {

				let result = false;


				let path = lychee.environment.resolve(id);
				if (path.startsWith(lychee.ROOT.project)) {

					if (asset !== null) {

						let dir = path.split('/').slice(0, -1).join('/');
						if (dir.startsWith(lychee.ROOT.project)) {
							// TODO: mkdirp(dir);
						}


						let data = lychee.serialize(asset);
						let enc  = _ENCODING[data.constructor] || _ENCODING['Stuff'];

						if (data !== null && data.blob instanceof Object) {

							let buffer = data.blob.buffer || null;
							if (buffer instanceof Object) {

								for (let sub in buffer) {

									if (typeof buffer[sub] === 'string') {

										let index = buffer[sub].indexOf('base64,') + 7;
										if (index > 7) {

											let tmp = buffer[sub].substr(index, buffer[sub].length - index);
											let raw = Buffer.from(tmp, 'base64');
											let buf = _to_arraybuffer(raw);

											try {
												let file = new _File(path + '.' + sub, { encoding: enc });
												file.writeSync(buf);
												file.closeSync();
												file   = null;
												result = true;
											} catch (err) {
												result = false;
											}

										}

									}

								}

							} else if (typeof buffer === 'string') {

								let index = buffer.indexOf('base64,') + 7;
								if (index > 7) {

									let tmp = buffer.substr(index, buffer.length - index);
									let raw = Buffer.from(tmp, 'base64');
									let buf = _to_arraybuffer(raw);

									try {
										let file = new _File(path, { encoding: enc });
										file.writeSync(buf);
										file.closeSync();
										file   = null;
										result = true;
									} catch (err) {
										result = false;
									}

								}

							}

						}

					} else {

						try {
							let file = new _File(path);
							file.rm();
							file.closeSync();
							result = true;
						} catch (err) {
							result = false;
						}

					}

				}


				if (result === false) {
					console.error('lychee.Stash: Could not write "' + id + '".');
					console.info('lychee.Stash: Check filesystem quota and permissions.');
				}


				return result;

			};

		}


		if (lychee.debug === true) {

			let methods = [];

			if (rm && write) methods.push('Persistent');
			if (_TEMPORARY)  methods.push('Temporary');


			if (methods.length === 0) {
				console.error('lychee.Stash: Supported methods are NONE');
			} else {
				console.info('lychee.Stash: Supported methods are ' + methods.join(', '));
			}

		}

	})();



	/*
	 * HELPERS
	 */

	const _validate_asset = function(asset) {

		if (asset instanceof Object && typeof asset.serialize === 'function') {
			return true;
		}

		return false;

	};

	const _read_stash = function(silent) {

		silent = silent === true;


		let blob = null;


		let type = this.type;
		if (type === Composite.TYPE.persistent) {

			blob = _PERSISTENT.read();

		} else if (type === Composite.TYPE.temporary) {

			blob = _TEMPORARY.read();

		}


		if (blob !== null) {

			if (Object.keys(this.__assets).length !== Object.keys(blob).length) {

				this.__assets = {};

				for (let id in blob) {
					this.__assets[id] = blob[id];
				}


				if (silent === false) {
					this.trigger('sync', [ this.__assets ]);
				}

			}


			return true;

		}


		return false;

	};

	const _write_stash = function(silent) {

		silent = silent === true;


		let operations = this.__operations;
		let filtered   = {};

		if (operations.length !== 0) {

			while (operations.length > 0) {

				let operation = operations.shift();
				if (operation.type === 'update') {

					filtered[operation.id] = operation.asset;

					if (this.__assets[operation.id] !== operation.asset) {
						this.__assets[operation.id] = operation.asset;
					}

				} else if (operation.type === 'remove') {

					filtered[operation.id] = null;

					if (this.__assets[operation.id] !== null) {
						this.__assets[operation.id] = null;
					}

				}

			}


			let type = this.type;
			if (type === Composite.TYPE.persistent) {

				for (let id in filtered) {
					_PERSISTENT.write(id, filtered[id]);
				}

			} else if (type === Composite.TYPE.temporary) {

				for (let id in filtered) {
					_TEMPORARY.write(id, filtered[id]);
				}

			}


			if (silent === false) {
				this.trigger('sync', [ this.__assets ]);
			}


			return true;

		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.id   = 'lychee-Stash-' + _id++;
		this.type = Composite.TYPE.persistent;


		this.__assets     = {};
		this.__operations = [];


		this.setId(states.id);
		this.setType(states.type);


		_Emitter.call(this);



		/*
		 * INITIALIZATION
		 */

		_read_stash.call(this);


		states = null;

	};


	Composite.TYPE = {
		persistent: 0,
		temporary:  1
	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		sync: function(silent) {

			silent = silent === true;


			let result = false;

			if (Object.keys(this.__assets).length > 0) {

				this.__operations.push({
					type: 'sync'
				});

			}

			if (this.__operations.length > 0) {
				result = _write_stash.call(this, silent);
			} else {
				result = _read_stash.call(this, silent);
			}

			return result;

		},

		deserialize: function(blob) {

			if (blob.assets instanceof Object) {

				this.__assets = {};

				for (let id in blob.assets) {
					this.__assets[id] = lychee.deserialize(blob.assets[id]);
				}

			}

		},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.Stash';

			let states = {};
			let blob   = (data['blob'] || {});


			if (this.id.startsWith('lychee-Stash-') === false) states.id   = this.id;
			if (this.type !== Composite.TYPE.persistent)       states.type = this.type;


			if (Object.keys(this.__assets).length > 0) {

				blob.assets = {};

				for (let id in this.__assets) {
					blob.assets[id] = lychee.serialize(this.__assets[id]);
				}

			}


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		read: function(urls, callback, scope) {

			urls     = urls instanceof Array        ? urls     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (urls !== null) {

				let result  = [];
				let loading = 0;

				for (let u = 0, ul = urls.length; u < ul; u++) {

					let url = urls[u];
					if (typeof url === 'string') {

						let asset = new _Asset(url, null, true);
						if (asset !== null) {

							loading++;

							asset.onload = function() {

								loading--;

								if (callback !== null && loading === 0) {
									callback.call(scope, result);
								}

							};

							this.__assets[url] = asset;
							result.push(asset);
							asset.load();

						}

					}

				}

				if (callback !== null) {
					return;
				} else {
					return result;
				}

			}


			if (callback !== null) {
				callback.call(scope, []);
			} else {
				return [];
			}

		},

		remove: function(urls, callback, scope) {

			urls     = urls instanceof Array        ? urls     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (urls !== null) {

				for (let u = 0, ul = urls.length; u < ul; u++) {

					let url = urls[u];
					if (typeof url === 'string') {
						this.__operations.push({
							type: 'remove',
							id:   urls[u]
						});
					}

				}

				_write_stash.call(this);

				if (callback !== null) {
					callback.call(scope, true);
					return;
				} else {
					return true;
				}

			}


			if (callback !== null) {
				callback.call(scope, false);
			} else {
				return false;
			}

		},

		write: function(urls, assets, callback, scope) {

			urls     = urls instanceof Array        ? urls     : null;
			assets   = assets instanceof Array      ? assets   : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (urls !== null && assets !== null) {

				if (urls.length === assets.length) {

					for (let u = 0, ul = urls.length; u < ul; u++) {

						let url   = urls[u];
						let asset = assets[u];

						if (typeof url === 'string' && _validate_asset(asset) === true) {

							this.__operations.push({
								type:  'update',
								id:    url,
								asset: asset
							});

						}

					}

					_write_stash.call(this);

					if (callback !== null) {
						callback.call(scope, true);
						return;
					} else {
						return true;
					}

				}

			}


			if (callback !== null) {
				callback.call(scope, false);
			} else {
				return false;
			}

		},

		setId: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				this.id = id;

				return true;

			}


			return false;

		},

		setType: function(type) {

			type = lychee.enumof(Composite.TYPE, type) ? type : null;


			if (type !== null) {

				this.type = type;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

