
lychee.define('game.Jukebox').includes([
	'lychee.game.Jukebox'
]).requires([
	'lychee.Track'
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.Jukebox.call(this, 20, game.loop);

		var base = game.settings.base + '/snd';
		var formats = [ 'ogg', 'mp3', 'gsm', 'amr' ];

		var tracks = [
			// 'music',
			'click'
		];


		for (var t = 0, l = tracks.length; t < l; t++) {

			var track = new lychee.Track(tracks[t], {
				base: base + '/' + tracks[t],
				formats: formats
			});

			this.add(track);

		}

	};


	return Class;

});

