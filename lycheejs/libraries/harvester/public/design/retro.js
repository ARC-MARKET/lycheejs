
(function(global, $) {

	const _retro = function() {

		let body = $('#body');
		if (body !== null) {

			let time = new Date();
			let hour = time.getHours() + time.getMinutes() / 60;
			if (hour > 0 && hour < 6) {
				body.state('retro');
			} else {
				body.state('');
			}

		}

	};


	let body = $('body');
	if (body !== null) {
		setInterval(_retro, 1000 * 60 * 15);
		_retro();
	}

})(typeof window !== 'undefined' ? window : this, window.$);

