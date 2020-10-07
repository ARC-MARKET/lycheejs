
(function(flow) {

	flow.then(function(oncomplete) {

		let cell    = this.main.state.query('game > immune');
		let vesicle = cell.getVesicle('immune');


		let layer = this.main.state.query('ui');
		if (layer !== null) {

			layer.trigger('touch', [ 0, {
				x: cell.position.x + vesicle.position.x,
				y: cell.position.y + vesicle.position.y
			}, 0 ]);


			let button = this.main.state.query('ui > confirm');
			if (button.visible === true) {

				button.bind('touch', function() {
					oncomplete(true);
				}, this, true);

				button.trigger('touch', [ 0, {
					x: 0,
					y: 0
				}, 0 ]);

			} else {

				oncomplete(false);

			}

		} else {

			oncomplete(false);

		}

	});

	flow.bind('error', function(error) {
		console.error(error);
	}, this);

	flow.bind('complete', function() {
		console.info('Flow completed.');
	}, this);

	flow.init();

})(new lychee.app.Flow(this.MAIN));

