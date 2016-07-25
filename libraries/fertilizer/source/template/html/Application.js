
lychee.define('fertilizer.template.html.Application').includes([
	'fertilizer.Template'
]).exports(function(lychee, global, attachments) {

	var _Template  = lychee.import('fertilizer.Template');
	var _TEMPLATES = {
		config: attachments["config.tpl"],
		core:   null,
		icon:   attachments["icon.png"],
		index:  attachments["index.tpl"]
	};



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		_Template.call(this, data);


		this.__config = lychee.deserialize(lychee.serialize(_TEMPLATES.config));
		this.__core   = lychee.deserialize(lychee.serialize(_TEMPLATES.core));
		this.__icon   = lychee.deserialize(lychee.serialize(_TEMPLATES.icon));
		this.__index  = lychee.deserialize(lychee.serialize(_TEMPLATES.index));



		/*
		 * INITIALIZATION
		 */

		this.bind('configure', function(oncomplete) {

			console.log('fertilizer: CONFIGURE');


			var that   = this;
			var load   = 3;
			var config = this.stash.read('./manifest.json');
			var core   = this.stash.read('/libraries/lychee/build/html/core.js');
			var icon   = this.stash.read('./icon.png');

			if (config !== null) {

				config.onload = function(result) {

					if (result === true) {
						that.__config = this;
					}

					if ((--load) === 0) {
						oncomplete(true);
					}

				};

				config.load();

			}

			if (core !== null) {

				core.onload = function(result) {

					if (result === true) {
						that.__core = this;
					}

					if ((--load) === 0) {
						oncomplete(true);
					}

				};

				core.load();

			}

			if (icon !== null) {

				icon.onload = function(result) {

					if (result === true) {
						that.__icon = this;
					}

					if ((--load) === 0) {
						oncomplete(true);
					}

				};

				icon.load();

			}


			if (config === null && core === null && icon === null) {
				oncomplete(false);
			}

		}, this);

		this.bind('build', function(oncomplete) {

			var env   = this.environment;
			var stash = this.stash;

			if (env !== null && stash !== null) {

				console.log('fertilizer: BUILD ' + env.id);


				var sandbox = this.sandbox;
				var config  = this.__config;
				var core    = this.__core;
				var icon    = this.__icon;
				var index   = this.__index;


				config.buffer = config.buffer.replaceObject({
					debug:   env.debug,
					id:      env.id,
					version: lychee.VERSION
				});

				index.buffer = index.buffer.replaceObject({
					blob:    env.serialize(),
					id:      env.id,
					profile: this.profile
				});


				stash.write(sandbox + '/manifest.json', config);
				stash.write(sandbox + '/core.js',       core);
				stash.write(sandbox + '/icon.png',      icon);
				stash.write(sandbox + '/index.html',    index);


				oncomplete(true);

			} else {

				oncomplete(false);

			}

		}, this);

		this.bind('package', function(oncomplete) {
			console.log('fertilizer: PACKAGE');
			oncomplete(true);
		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Template.prototype.serialize.call(this);
			data['constructor'] = 'fertilizer.template.html.Application';


			return data;

		}

	};


	return Composite;

});

