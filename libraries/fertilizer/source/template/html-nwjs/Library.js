
lychee.define('fertilizer.template.html-nwjs.Library').includes([
	'fertilizer.Template'
]).exports(function(lychee, global, attachments) {

	var _Template = lychee.import('fertilizer.Template');
	var _TEMPLATE = attachments["tpl"];



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		_Template.call(this, data);


		this.__index = lychee.deserialize(lychee.serialize(_TEMPLATE));



		/*
		 * INITIALIZATION
		 */

		this.bind('configure', function(oncomplete) {
			console.log('fertilizer: CONFIGURE');
			oncomplete(true);
		}, this);

		this.bind('build', function(oncomplete) {

			var env   = this.environment;
			var stash = this.stash;

			if (env !== null && stash !== null) {

				console.log('fertilizer: BUILD ' + env.id);


				var sandbox = this.sandbox;
				var index   = this.__index;


				index.buffer = index.buffer.replaceObject({
					blob: env.serialize(),
					id:   env.id
				});


				stash.write(sandbox + '/index.js', index);


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
			data['constructor'] = 'fertilizer.template.html-nwjs.Library';


			return data;

		}

	};


	return Composite;

});

