
lychee.define('lychee.ui.element.Jukebox').requires([
	'lychee.app.Jukebox',
	'lychee.ui.entity.Slider',
	'lychee.ui.entity.Switch'
]).includes([
	'lychee.ui.Element'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _read = function() {

		var main = global.MAIN || null;
		if (main !== null) {

			var jukebox = main.jukebox || null;
			if (jukebox !== null) {

				var channels = jukebox.channels;
				var music    = jukebox.music;
				var sound    = jukebox.sound;
				var volume   = jukebox.volume;


				this.getEntity('channels').setValue(channels);
				this.getEntity('music').setValue(music === true ? 'on' : 'off');
				this.getEntity('sound').setValue(sound === true ? 'on' : 'off');
				this.getEntity('volume').setValue(volume * 10);

			}

		}

	};

	var _save = function() {

		var main = global.MAIN || null;
		if (main !== null) {

			var jukebox = main.jukebox || null;
			if (jukebox !== null) {

				var channels = this.getEntity('channels').value;
				var music    = this.getEntity('music').value;
				var sound    = this.getEntity('sound').value;
				var volume   = this.getEntity('volume').value;


				jukebox.setChannels(channels);
				jukebox.setMusic(music === 'on' ? true : false);
				jukebox.setSound(sound === 'on' ? true : false);
				jukebox.setVolume(volume / 10);

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		settings.label   = 'Jukebox';
		settings.options = [ 'Save' ];


		lychee.ui.Element.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.setEntity('music', new lychee.ui.entity.Switch({
			value: 'on'
		}));

		this.setEntity('sound', new lychee.ui.entity.Switch({
			value: 'on'
		}));

		this.setEntity('channels', new lychee.ui.entity.Slider({
			type:  lychee.ui.entity.Slider.TYPE.horizontal,
			min:   0,
			max:   16,
			step:  1,
			value: 8
		}));

		this.setEntity('volume', new lychee.ui.entity.Slider({
			type:  lychee.ui.entity.Slider.TYPE.horizontal,
			min:    0,
			max:   10,
			step:   1,
			value: 10
		}));

		this.bind('change', function(action) {

			if (action === 'save') {
				_save.call(this);
			}

		}, this);


		_read.call(this);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.Element.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.element.Jukebox';


			return data;

		}

	};


	return Class;

});

