
lychee.define('studio.event.flow.Font').includes([
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

				entity.setValue('/projects/immune');
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

		this.bind('select-asset-font', function(oncomplete) {

			let entity = this.main.state.query('ui > asset > select > search');
			if (entity !== null) {

				entity.setValue('ui/entity/Test.fnt');
				entity.trigger('change', [ entity.value ]);

				setTimeout(_ => oncomplete(true), 250);

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('modify-asset-font', function(oncomplete) {

			let color = this.main.state.query('ui > asset > modify > color');
			if (color !== null) {
				color.setValue('#ff00ff');
				color.trigger('change', [ color.value ]);
			}

			let size = this.main.state.query('ui > asset > modify > size');
			if (size !== null) {
				size.setValue(64);
				size.trigger('change', [ size.value ]);
			}

			let style = this.main.state.query('ui > asset > modify > style');
			if (style !== null) {
				style.setValue('italic');
				style.trigger('change', [ style.value ]);
			}

			let spacing = this.main.state.query('ui > asset > modify > spacing');
			if (spacing !== null) {
				spacing.setValue(16);
				spacing.trigger('change', [ spacing.value ]);
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

		this.bind('preview-asset-save', function(oncomplete) {

			let button = this.main.state.query('ui > asset > preview > @options-next');
			if (button !== null) {
				button.trigger('touch');
				oncomplete(true);
			} else {
				oncomplete(false);
			}

		}, this);



		/*
		 * FLOW
		 */

		this.then('select-project');
		this.then('select-asset');

		this.then('select-asset-font');
		this.then('modify-asset-font');

		this.then('preview-asset');
		this.then('preview-asset-save');

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Flow.prototype.serialize.call(this);
			data['constructor'] = 'studio.event.flow.Font';


			return data;

		}

	};


	return Composite;

});

