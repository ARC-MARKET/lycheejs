
lychee.define('lychee.ui.element.Jukebox').requires([
	'lychee.app.Jukebox',
	'lychee.ui.entity.Slider',
	'lychee.ui.entity.Switch'
]).includes([
	'lychee.ui.Element'
]).exports(function(lychee, global, attachments) {

	const _Element = lychee.import('lychee.ui.Element');
	const _Slider  = lychee.import('lychee.ui.entity.Slider');
	const _Switch  = lychee.import('lychee.ui.entity.Switch');



	/*
	 * HELPERS
	 */

	const _read = function() {

		let main = global.MAIN || null;
		if (main !== null) {

			let jukebox = main.jukebox || null;
			if (jukebox !== null) {

				let channels = jukebox.channels;
				let music    = jukebox.music;
				let sound    = jukebox.sound;
				let volume   = jukebox.volume;


				this.getEntity('channels').setValue(channels);
				this.getEntity('music').setValue(music === true ? 'on' : 'off');
				this.getEntity('sound').setValue(sound === true ? 'on' : 'off');
				this.getEntity('volume').setValue(volume * 10);

			}

		}

	};

	const _save = function() {

		let main = global.MAIN || null;
		if (main !== null) {

			let jukebox = main.jukebox || null;
			if (jukebox !== null) {

				let channels = this.getEntity('channels').value;
				let music    = this.getEntity('music').value;
				let sound    = this.getEntity('sound').value;
				let volume   = this.getEntity('volume').value;


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

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		settings.label   = 'Jukebox';
		settings.options = [ 'Save' ];


		_Element.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.setEntity('music', new _Switch({
			value: 'on'
		}));

		this.setEntity('sound', new _Switch({
			value: 'on'
		}));

		this.setEntity('channels', new _Slider({
			type:  _Slider.TYPE.horizontal,
			min:   0,
			max:   16,
			step:  1,
			value: 8
		}));

		this.setEntity('volume', new _Slider({
			type:  _Slider.TYPE.horizontal,
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


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.element.Jukebox';


			return data;

		}

	};


	return Composite;

});

