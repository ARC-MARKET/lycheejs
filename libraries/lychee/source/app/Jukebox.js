
lychee.define('lychee.app.Jukebox').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.channels = 8;
		this.music    = true;
		this.sound    = true;
		this.volume   = 1.0;

		this.__music  = null;
		this.__sounds = [
			null, null,
			null, null,
			null, null,
			null, null
		];


		this.setChannels(settings.channels);
		this.setMusic(settings.music);
		this.setSound(settings.sound);
		this.setVolume(settings.volume);


		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let settings = {};


			if (this.channels !== 8) settings.channels = this.channels;
			if (this.music !== true) settings.music    = this.music;
			if (this.sound !== true) settings.sound    = this.sound;
			if (this.volume !== 1.0) settings.volume   = this.volume;


			return {
				'constructor': 'lychee.app.Jukebox',
				'arguments':   [ settings ],
				'blob':        null
			};

		},



		/*
		 * CUSTOM API
		 */

		play: function(track) {

			let volume = this.volume;


			if (track instanceof Music && this.music === true) {

				let music = this.__music;
				if (music !== null) {
					music.stop();
				}


				this.__music = track;
				this.__music.setVolume(this.volume);
				this.__music.play();


				return true;

			} else if (track instanceof Sound && this.sound === true) {

				let found  = false;
				let sounds = this.__sounds;

				for (let s = 0, sl = sounds.length; s < sl; s++) {

					let sound = sounds[s];
					if (sound === null) {

						sounds[s] = track.clone();
						sounds[s].setVolume(volume);
						sounds[s].play();
						found = true;

						break;

					} else if (sound.isIdle === true) {

						if (sound.url === track.url) {

							sound.setVolume(volume);
							sound.play();
							found = true;

							break;

						}

					}

				}


				if (found === false) {

					if (track.isIdle === true) {

						track.setVolume(volume);
						track.play();

					} else {

						for (let s = 0, sl = sounds.length; s < sl; s++) {

							let sound = sounds[s];
							if (sound.isIdle === true) {

								sounds[s] = null;
								sounds[s] = track.clone();
								sounds[s].setVolume(volume);
								sounds[s].play();

								break;

							}

						}

					}

				}


				return true;

			}


			return false;

		},

		stop: function(track) {

			track = (track instanceof Music || track instanceof Sound) ? track : null;


			let found  = false;
			let music  = this.__music;
			let sounds = this.__sounds;


			let s, sl, sound = null;

			if (track instanceof Music) {

				if (music === track) {
					found = true;
					music.stop();
				}


				this.__music = null;

			} else if (track instanceof Sound) {

				for (s = 0, sl = sounds.length; s < sl; s++) {

					sound = sounds[s];

					if (sound !== null && sound.url === track.url && sound.isIdle === false) {
						found = true;
						sound.stop();
					}

				}

			} else if (track === null) {

				if (music !== null) {
					found = true;
					music.stop();
				}


				for (s = 0, sl = sounds.length; s < sl; s++) {

					sound = sounds[s];

					if (sound !== null && sound.isIdle === false) {
						found = true;
						sound.stop();
					}

				}

			}


			if (found === true) {
				return true;
			}


			return false;

		},

		setChannels: function(channels) {

			channels = typeof channels === 'number' ? channels : null;


			if (channels !== null) {

				this.channels = channels;
				this.__sounds.fill(null);


				return true;

			}


			return false;

		},

		setMusic: function(music) {

			if (music === true || music === false) {

				this.music = music;


				return true;

			}


			return false;

		},

		setSound: function(sound) {

			if (sound === true || sound === false) {

				this.sound = sound;


				return true;

			}


			return false;

		},

		setVolume: function(volume) {

			volume = typeof volume === 'number' ? volume : null;


			if (volume !== null) {

				this.volume = Math.min(Math.max(0, volume), 1);


				let music = this.__music;
				if (music !== null) {
					music.setVolume(this.volume);
				}


				let sounds = this.__sounds;
				for (let s = 0, sl = sounds.length; s < sl; s++) {

					let sound = sounds[s];
					if (sound !== null) {
						sound.setVolume(this.volume);
					}

				}


				return true;

			}


			return false;

		}

	};


	return Composite;

});

