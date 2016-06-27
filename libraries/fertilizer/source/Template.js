
lychee.define('fertilizer.Template').requires([
	'lychee.Stash',
	'fertilizer.data.Shell'
]).includes([
	'lychee.event.Flow'
]).exports(function(lychee, global, attachments) {

	var _Stash = lychee.import('lychee.Stash');
	var _Shell = lychee.import('fertilizer.data.Shell');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.environment = null;
		this.sandbox     = '';
		this.settings    = {};
		this.profile     = null;
		this.shell       = new _Shell();
		this.stash       = new _Stash({
			type: _Stash.TYPE.persistent
		});


		this.setEnvironment(settings.environment);
		this.setProfile(settings.profile);
		this.setSandbox(settings.sandbox);
		this.setSettings(settings.settings);


		lychee.event.Flow.call(this);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var environment = lychee.deserialize(blob.environment);
			var shell       = lychee.deserialize(blob.shell);
			var stash       = lychee.deserialize(blob.stash);

			if (environment !== null) {
				this.setEnvironment(environment);
			}

			if (shell !== null) {
				this.shell = shell;
			}

			if (stash !== null) {
				this.stash = stash;
			}

		},

		serialize: function() {

			var data = lychee.event.Flow.prototype.serialize.call(this);
			data['constructor'] = 'fertilizer.Template';


			var settings = data['arguments'][0] || {};
			var blob     = data['blob'] || {};


			if (this.profile !== null)                 settings.profile  = this.profile;
			if (this.sandbox !== '')                   settings.sandbox  = this.sandbox;
			if (Object.keys(this.settings).length > 0) settings.settings = this.settings;


			if (this.environment !== null) blob.environment = lychee.serialize(this.environment);
			if (this.shell !== null)       blob.shell       = lychee.serialize(this.shell);
			if (this.stash !== null)       blob.stash       = lychee.serialize(this.stash);


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setEnvironment: function(environment) {

			environment = environment instanceof lychee.Environment ? environment : null;


			if (environment !== null) {

				this.environment = environment;

				return true;

			}


			return false;

		},

		setProfile: function(profile) {

			profile = profile instanceof Object ? profile : null;


			if (profile !== null) {

				this.profile = profile;

				return true;

			}


			return false;

		},

		setSandbox: function(sandbox) {

			sandbox = typeof sandbox === 'string' ? sandbox : null;


			if (sandbox !== null) {

				this.sandbox = sandbox;


				return true;

			}


			return false;

		},

		setSettings: function(settings) {

			settings = settings instanceof Object ? settings : null;


			if (settings !== null) {

				this.settings = settings;

				return true;

			}


			return false;

		}

	};


	return Class;

});

