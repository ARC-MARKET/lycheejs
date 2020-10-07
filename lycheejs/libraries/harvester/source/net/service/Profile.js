
lychee.define('harvester.net.service.Profile').requires([
	'harvester.data.Filesystem',
	'lychee.codec.JSON'
]).includes([
	'lychee.net.Service'
]).exports((lychee, global, attachments) => {

	const _Filesystem = lychee.import('harvester.data.Filesystem');
	const _Service    = lychee.import('lychee.net.Service');
	const _CACHE      = {};
	const _FILESYSTEM = new _Filesystem({
		root: '/libraries/harvester/profiles'
	});
	const _JSON       = lychee.import('lychee.codec.JSON');



	/*
	 * FEATURE DETECTION
	 */

	(function(cache, filesystem) {

		let identifiers = filesystem.dir('/').map(path => path.split('.').slice(0, -1).join('.'));
		if (identifiers.length > 0) {

			identifiers.forEach(identifier => {

				let profile = filesystem.read('/' + identifier + '.json');
				if (profile !== null) {
					cache[identifier] = _JSON.decode(profile);
					cache[identifier].identifier = identifier;
				}

			});

		}

	})(_CACHE, _FILESYSTEM);



	/*
	 * HELPERS
	 */

	const _save_profile = function(profile) {

		let path = '/' + profile.identifier + '.json';
		let data = _JSON.encode(profile);

		if (data !== null) {

			_FILESYSTEM.write(path, data);

			return true;

		}


		return false;

	};

	const _serialize = function(profile) {

		return {
			identifier: profile.identifier || '',
			host:       profile.host       || 'localhost',
			port:       profile.port       || 8080,
			debug:      profile.debug      || false
		};

	};

	const _on_save = function(data) {

		let identifier = data.identifier || null;
		if (identifier !== null) {

			let profile = _CACHE[identifier] || null;
			if (profile !== null) {

				profile.identifier = identifier;
				profile.host       = data.host  || 'localhost';
				profile.port       = data.port  || 8080;
				profile.debug      = data.debug || false;

				_save_profile(profile);

				this.accept('Profile updated ("' + identifier + '")');

			} else {

				this.reject('No profile ("' + identifier + '")');

			}

		} else {

			this.reject('No identifier');

		}

	};

	const _on_sync = function(data) {

		if (data instanceof Array) {

			data.forEach(object => {
				_CACHE[object.identifier] = object;
			});

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		_Service.call(this, states);

		states = null;



		/*
		 * INITIALIZATION: CLIENT
		 */

		this.bind('sync', _on_sync, this);



		/*
		 * INITIALIZATION: REMOTE
		 */

		this.bind('save', _on_save, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.service.Profile';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		index: function() {

			return this.send(Object.values(_CACHE).map(_serialize), {
				event: 'sync'
			});

		},

		save: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				let profile = {
					identifier: typeof data.identifier === 'string' ? data.identifier : null,
					host:       typeof data.host === 'string'       ? data.host       : null,
					port:       typeof data.port === 'string'       ? data.port       : null,
					debug:      data.debug   === true
				};

				if (profile.identifier !== null && profile.host !== null && profile.port !== null) {

					return this.send(profile, {
						event: 'save'
					});

				}

			}


			return false;

		},

		sync: function() {

			let tunnel = this.tunnel;
			if (tunnel !== null) {

				if (tunnel.type === 'client') {

					return this.send({}, {
						method: 'index'
					});

				} else if (tunnel.type === 'remote') {

					return this.index();

				}

			}


			return false;

		}

	};


	return Composite;

});

