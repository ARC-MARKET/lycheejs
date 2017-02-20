
lychee.define('harvester.net.remote.Profile').requires([
	'harvester.data.Filesystem',
	'lychee.codec.JSON'
]).includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Filesystem = lychee.import('harvester.data.Filesystem');
	const _Service    = lychee.import('lychee.net.Service');
	const _CACHE      = {};
	const _FILESYSTEM = new _Filesystem('/libraries/harvester/profiles');
	const _JSON       = lychee.import('lychee.codec.JSON');



	/*
	 * FEATURE DETECTION
	 */

	(function(cache, filesystem) {

		let identifiers = filesystem.dir('/').map(function(value) {
			return value.split('.').slice(0, -1).join('.');
		});

		if (identifiers.length > 0) {

			identifiers.forEach(function(identifier) {

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
			debug:      profile.debug      || false,
			sandbox:    profile.sandbox    || false
		};

	};

	const _on_save = function(data) {

		let identifier = data.identifier || null;
		if (identifier !== null) {

			let profile = _CACHE[identifier] || null;
			if (profile !== null) {

				profile.identifier = identifier;
				profile.host       = data.host    || 'localhost';
				profile.port       = data.port    || 8080;
				profile.debug      = data.debug   || false;
				profile.sandbox    = data.sandbox || false;


				_save_profile(profile);


				this.accept('Profile updated ("' + identifier + '")');

			} else {

				this.reject('No profile ("' + identifier + '")');

			}

		} else {

			this.reject('No identifier');

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(remote) {

		_Service.call(this, 'profile', remote, _Service.TYPE.remote);


		this.bind('save', _on_save, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.remote.Profile';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		index: function(data) {

			let tunnel = this.tunnel;
			if (tunnel !== null) {

				let profiles = Object.values(_CACHE).filter(function(profile) {
					return /cultivator/g.test(profile.identifier) === false;
				}).map(_serialize);


				tunnel.send(profiles, {
					id:    this.id,
					event: 'sync'
				});

			}

		},

		sync: function() {
			this.index();
		}

	};


	return Composite;

});

