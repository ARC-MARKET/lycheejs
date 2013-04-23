
lychee.define('game.DeviceSpecificHacks').exports(function(lychee, global) {

	var Callback = function() {

		if (typeof global.navigator !== 'undefined') {

			if (global.navigator.appName === 'V8GL') {

				this.settings.fullscreen = true;
				this.settings.music = false;
				this.settings.sound = false;

			} else if (global.navigator.userAgent.match(/iPad/)) {

				this.settings.fullscreen = true;
				this.settings.music = false;
				this.settings.sound = true;

			} else if (global.navigator.userAgent.match(/Android/)) {

				this.settings.fullscreen = true;

			}

		}

	};

	return Callback;

});
