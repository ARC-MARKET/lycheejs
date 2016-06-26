
lychee.define('app.ui.element.Project').requires([
	'lychee.ui.entity.Button'
]).includes([
	'lychee.ui.Element'
]).exports(function(lychee, global, attachments) {



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		settings.label   = 'Project';
		settings.options = [ 'Open', 'Save' ];


		lychee.ui.Element.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.setEntity('icon', new lychee.ui.entity.Upload({

		}));

		this.setEntity('identifier', new lychee.ui.entity.Input({
			type:  lychee.ui.entity.Input.TYPE.text,
			value: this.identifier
		}));

		this.setEntity('harvester', new lychee.ui.entity.Switch({
			options: [ 'on', 'off' ],
			value:   this.harvester === true ? 'on' : 'off'
		}));


	};


	Class.prototype = {

	};


	return Class;

});

