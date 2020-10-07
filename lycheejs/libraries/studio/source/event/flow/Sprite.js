lychee.define('studio.event.flow.Sprite').includes([
	'lychee.event.Flow'
]).exports((lychee, global, attachments) => {

	const _Flow = lychee.import('lychee.event.Flow');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.main = states.main || null;


		_Flow.call(this);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('select-project', function(oncomplete) {

			let entity = this.main.state.query('ui > project > select > search');
			if (entity !== null) {

				entity.setValue('/projects/lethalmaze');
				entity.trigger('change', [ entity.value ]);

				setTimeout(_ => oncomplete(true), 250);

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('select-asset', function(oncomplete) {

			let entity = this.main.state.query('ui > menu');
			if (entity !== null) {

				entity.setValue('Asset');
				entity.trigger('change', [ entity.value ]);

				setTimeout(_ => oncomplete(true), 1000);

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('select-asset-sprite', function(oncomplete) {

			let entity = this.main.state.query('ui > asset > select > search');
			if (entity !== null) {

				entity.setValue('app/sprite/Tank.png');
				entity.trigger('change', [ entity.value ]);

				setTimeout(_ => oncomplete(true), 250);

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('modify-asset-sprite', function(oncomplete) {

			let shape = this.main.state.query('ui > asset > modify > shape');
			if (shape !== null) {
				shape.setValue('rectangle');
				shape.trigger('change', [ shape.value ]);
			}

			let width = this.main.state.query('ui > asset > modify > width');
			if (width !== null) {
				width.setValue(32);
				width.trigger('change', [ width.value ]);
			}

			let height = this.main.state.query('ui > asset > modify > height');
			if (height !== null) {
				height.setValue(32);
				height.trigger('change', [ height.value ]);
			}

			setTimeout(_ => oncomplete(true), 250);

		}, this);

		this.bind('preview-asset', function(oncomplete) {

			let preview = this.main.state.query('ui > asset > preview');
			if (preview !== null) {
				preview.trigger('relayout');
				setTimeout(_ => oncomplete(true), 500);
			} else {
				oncomplete(false);
			}

		}, this);



		/*
		 * FLOW
		 */

		this.then('select-project');
		this.then('select-asset');

		this.then('select-asset-sprite');
		this.then('modify-asset-sprite');

		this.then('preview-asset');

	};


	Composite.prototype = {

		deserialize: function(blob) {

			_Flow.prototype.deserialize.call(this, blob);

		},

		serialize: function() {

			let data = _Flow.prototype.serialize.call(this);
			data['constructor'] = 'studio.event.flow.Sprite';


			return data;

		}


	};


	return Composite;

});
