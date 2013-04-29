
lychee.define('game.webserver.Template').exports(function(lychee, global) {

	var Class = function(source) {

		this.__source = source;

	};


	Class.prototype = {

		render: function(data) {

			var functionbody = [];

			functionbody.push('var body = []; with(data){');

			var inScript = false;
			var chunks = this.__source.split(/\<%(.*?)%>/g);
			for (var c = 0, cl = chunks.length; c < cl; c++) {

				var chunk = chunks[c];

				chunk = chunk.replace('\'', '\\\'');

				if (chunk.substr(0, 7) === 'script%') {
					functionbody.push(chunk.substr(7));
					inScript = inScript === true ? false : true;
				} else if (chunk.substr(0, 1) === '=') {
					functionbody.push('body.push(' + chunk.substr(1) + ');');
				} else {

					if (chunk.indexOf('\n') !== -1) {

						var subchunks;
						if (chunk.indexOf('\r') !== -1) {
							subchunks = chunk.split('\r\n');
						} else {
							subchunks = chunk.split('\n');
						}


						for (var s = 0, sl = subchunks.length; s < sl; s++) {

							var subchunk = subchunks[s];

							var prefix = '';
							var suffix = '\\n';
							if (inScript === true) {

								subchunk = subchunk.replace(/^\s+|\s+$/g,'');
								suffix = '';

							} else if (s === sl - 1) {
								suffix = '';
							}

							functionbody.push('body.push(\'' + prefix + subchunk + suffix + '\');');

						}

					} else {

						functionbody.push('body.push(\'' + chunk + '\');');

					}

				}

			}

			functionbody.push('}; return body.join(\'\')');


			var callback = new Function('data', functionbody.join('\n'));

			return callback(data);

		}

	};


	return Class;

});

