
lychee.define('app.state.Welcome').includes([
	'lychee.ui.State'
]).requires([
	'lychee.ui.Blueprint',
	'lychee.ui.Element',
	'lychee.ui.Layer',
	'lychee.ui.element.Search'
]).exports(function(lychee, global, attachments) {

	var _State = lychee.import('lychee.ui.State');
	var _BLOB  = attachments["json"].buffer;



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		_State.call(this, main);


		this.deserialize(_BLOB);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _State.prototype.serialize.call(this);
			data['constructor'] = 'app.state.Welcome';


			return data;

		},

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			this.queryLayer('ui', 'menu').setHelpers([
				'refresh'
			]);


			this.queryLayer('ui', 'welcome > select').setData([
				'foo',
				'foo1',
				'foo2',
				'foo3',
				'foo4',
				'foo5'
			]);


			this.queryLayer('ui', 'welcome > select').bind('change', function(value) {

console.log('SELECTED', value);

			}, this);

		}

	};


	return Class;

});
