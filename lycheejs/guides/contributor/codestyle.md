
# Codestyle

## Linting

All lychee.js Libraries and Projects are linted and validated in the identical way.
All third-party projects must follow the same rules, otherwise AI support is dropped.

- Use [eslint](https://github.com/eslint/eslint) with our [.eslintrc.json](/.eslintrc.json) file.
- Use [editorconfig](http://editorconfig.org) plugin for your IDE with our [.editorconfig](/.editorconfig) file.
- Install `eslint` globally via `(sudo) npm install -g eslint`.
- Install the `editorconfig plugin` for your IDE from mentioned website.
- Use the `lycheejs-strainer` CLI tool to `check` and `stage` all libraries and projects.

## Project Layout

### Packages

The `lychee.pkg` file is divided in four sub-hierarchies that are tracked by the build system.

- `/api` is the API knowledge folder that is produced by the [lychee.js Strainer](../software/lycheejs-strainer.md).
- `/asset` is the asset folder that contains all raw assets and is automatically integrated with [lychee.js Studio](../software/lycheejs-studio.md).
- `/bin` is the integration script folder. Supported scripts are `configure.sh`, `build.sh`, `package.sh` and `publish.sh`.
- `/build` is the build variants folder that is produced by the [lychee.js Fertilizer](../software/lycheejs-fertilizer.md).
- `/review` is the review folder that contains all autonomous fuzz-tests, specifications and simulations.
- `/source` is the source variants folder that every developer can live-edit without any build tasks in between.

### Namespaces

Each subfolder located in `source` or `build` or `api` has to be written lowercase
and is automatically mapped into its equivalent namespace. It may contain either
Entities or other namespace folders.

Each namespace can be mapped as a tag that allows the implementation of platform-specific
adapters. Examples are `lychee.Input`, `lychee.Renderer`, `lychee.Storage`, `lychee.Viewport`
or the `lychee.net` Stack.

Those Definitions are mapped in the `platform` tag and often have nearly identical
feature-detecting `supports()` method calls.

An important mention here is that tags can inherit from other tags. Those inheriting
sub-tags are using a dash (`-`) as a divider. For example, the `html-nwjs` tag inherits
from `html` and reuses its components (if they are not overwritten).

Examples:

- `lychee/source/platform/html/Renderer` is equivalent to `lychee.Renderer`
- `lychee/source/platform/html-nwjs/Renderer` is equivalent to `lychee.Renderer`
- `lychee/source/platform/node/Renderer` is equivalent to `lychee.Renderer`

### Definitions

Each file located in `/api`, `/build` or `/source` has to be written Uppercase
and non-camelized and is automatically mapped into its equivalent namespace hierarchy
and identifier. A Definition has the file suffix `.js`.

A Definition may have attachments. Those attachments are mapped by their file extension.

- `Buffer` for a generic binary buffer.
- `Config` for files with the `json`, `pkg` or `store` extension.
- `Font` for files with the `fnt` extension.
- `Music` for files with the `msc` extension.
- `Sound` for files with the `snd` extension.
- `Texture` for files with the `png` extension.
- `Stuff` for files with an unknown extension.

The identifier for each Definition has to be uppercase and not camelized. If
there's an additional `.` in the filename it is automatically mapped as an
Attachment to the Definition.

Examples:

- `lychee/source/data/JSON.js` is equivalent to `lychee.data.JSON`
- `lychee/source/platform/html/data/JSON.js` is equivalent to `lychee.data.JSON`
- `lychee/source/Foo.js` and `lychee/source/Foo.default.png` and `lychee/source/Foo.fancy.png` is equivalent to `lychee.Foo` with `attachments = { "default.png": (Texture), "fancy.png": (Texture) }`.


## Definition Layout

The lychee.js Definition system always uses so-called Definition closures
in order to have advanced memory functionality among different instances.

A basic layout of a Definition has (if the functionality is required) these sections:

**HEADER**:

- `lychee.define(identifier)`
- `.tags()`
- `.requires()`
- `.includes()`
- `.attaches()`
- `.supports()`
- `.exports()`

**BODY** (inside `.exports()`):

- `FEATURE DETECTION` section
- `HELPERS` section
- `IMPLEMENTATION` section
- `ENTITY API` section
- `CUSTOM API` section
- return of `Composite`, `Module` or `Callback`

An important mention here is that three Definition types supported:

- `Module` is a singleton that has only static properties and methods, but no prototype. Its `deserialize()` call returns a `reference`.
- `Composite` is a dynamic composite implementation with public methods on its prototype. It is called using the `new <Definition>()` keyword. Its `deserialize()` call returns a `constructor`.
- `Callback` is a simple function that can not be called with the `new` keyword. Its `deserialize()` call returns a `reference`.

### Modules

A basic layout of a `Module` looks like this:

```javascript
lychee.define('my.ENCODER').requires([
	// optional requirements
	'my.Other'
]).exports((lychee, global, attachments) => {

	const _Other = lychee.import('my.Other');



	/*
	 * HELPERS
	 */

	const _encode = function(data) {
		return null;
	};

	const _decode = function(data) {
		return null;
	};



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'my.ENCODER',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		encode: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {
				return _encode(data);
			}

			return null;

		},

		decode: function(blob) {

			blob = typeof blob === 'string' ? blob : null;


			if (blob !== null) {
				return _decode(blob);
			}

			return null;

		}

	};


	return Module;

});
```

### Composites

```javascript
lychee.define('my.Definition').tags({
	// optional tags
	platform: 'html'
}).requires([
	// optional requirements
	'my.Other'
]).includes([
	// optional includes
	'lychee.game.Entity',
	'lychee.event.Emitter'
]).supports((lychee, global) => {

	// optional feature detection
	if (typeof global.addEventListener === 'function') {
		return true;
	}

	return false;

}).exports((lychee, global, attachments) => {

	const _Emitter       = lychee.import('lychee.event.Emitter');
	const _Entity        = lychee.import('lychee.game.Entity');
	const _Other         = lychee.import('my.Other');
	const _SHARED_MEMORY = [];



	/*
	 * HELPERS
	 */

	const _do_fancy_stuff = function() {

		for (let s = 0, sl = _SHARED_MEMORY.length; s++) {
			_SHARED_MEMORY[s].update(); // stub API for demo usage
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = lychee.extend({}, data);


		this.custom = null;

		this.setCustom(states.custom);


		// This order has to be identical to lychee.Definition.prototype.includes() call
		_Entity.call(this, states);
		_Emitter.call(this);


		_SHARED_MEMORY.push(this);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'my.Definition';

			let states = (data['arguments'][0] || {});
			let blob   = (data['blob'] || {});


			if (this.custom !== null) states.custom = this.custom;


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		// 1. imperative methods
		update: function() {
			// stub API for demo usage
		},

		// 2. setters and getters
		setCustom: function(custom) {

			custom = typeof custom === 'string' ? custom : null;


			if (custom !== null) {

				this.custom = custom;

				return true;

			}


			return false;

		}

	};


	return Composite;

});
```

### Callbacks

```javascript
lychee.define('my.Definition').exports((lychee, global, attachments) => {

	let _device = null;



	/*
	 * FEATURE DETECTION
	 */

	(function(global) {

		if (global.device.match(/Android/)) {
			_device = 'Android';
		} else if (global.device.match(/Ubuntu/)) {
			_device = 'Ubuntu';
		}

	})(global);



	/*
	 * IMPLEMENTATION
	 */

	const Callback = function() {

		return _device; // stub API for demo usage

	};


	return Callback;

});
```

## Code Layout

### Editorconfig

There's an `.editorconfig` file in the lychee.js root and you have to use it.
Use `\t` and NOT whitespaces. The `\t` character is equivalent to `4 Whitespaces`.

```javascript
// GOOD
let data = _CACHE[id];
if (data !== null) {
	data.load(); // data is all in the same column.
}

// BAD
let data = _CACHE[id];
if (data !== null) {
	data.load(); // This is not easy to rasterize.
}
```

### Indentation and Whitespaces

Code with whitespaces is easier to read than without them.
Use whitespaces wherever semantically required and necessary.

Whitespaces are necessary between operators.

```javascript
// GOOD
let y = 15;
let x = 3 * 4 + (y / 3);

// BAD
let y=15;
let x=3*4+(y/3);
```


One empty line is necessary when there's either a new condition
(if/else/switch) or a block of statements with more than 2 lines
of code.

```javascript
let data = _CACHE[id] || null;
if (data !== null) {

	data.onload = function() {

		let buffer = this.buffer;
		if (buffer instanceof Object) {

			buffer.blub = 'test';
			buffer.flag = true;
			buffer.woop = 123.37;

		}

	};

	data.load();

}
```

Two empty lines are necessary when there's a new leave-branch
condition or logical difference in the algorithm behaviour.

```javascript
const _my_method = function(data) {

	if (data !== null) {

		let filtered = [];

		data.forEach(function(entry) {

			if (entry.id > 100) {
				filtered.push(entry);
			}

		});

		return filtered;

	}


	// new leave-branch condition
	return null;

};
```


### Naming (Variables)

As in ES2018+ all variables are basically references in terms of
classical programming languages, there's a necessity of using
uppercase / lowercase names for variables to easily figure out
the memory layout and behaviour of those.

- Static variables and Enums are completely written uppercase.
- Shared variables between multiple instances have a prefixed underscore.
- Constructors are written uppercase-first.
- Instances are written lowercase.
- Namespaces are written lowercase (as they are Object instances in ES2018+).


```javascript
const _Entity = lychee.app.Entity;
const _CACHE  = {};

const Constructor = function(states) {

	this.entity = new _Entity(states);

	_CACHE.push(this);

};


let foo = new Constructor({ woop: true });
let bar = new Constructor({ woop: true });
```

As `lychee.define` or `new lychee.Definition()` uses a Definition
closure, there exists the full advantages of using shared and static
variables within the Definition closure. Shared variables all have to
be assigned at the top (see above).

### Naming (Properties and Methods)

Properties of Composites and Modules are named according to their visibility.

- Public properties are written lowercase (`.public`).
- Protected properties are written lowercase and have a prefixed underscore (`._protected`).
- Private properties are written lowercase and have two prefixed underscores (`.__private`).
- If there's a public property with `name`, there has to exist a `setName` method on the prototype (`setName: function() {}`).
- The return value of a `setName` method always has to be `true` or `false`.
- The `setName` method is always called in the `Constructor`, so that it accepts a `states[name]` value.
- Events and Flows are an exception, they have three prefixed underscores internally to be available across all `lychee.Definition` instances without any conflicts.

```javascript
const Composite = function(data) {

	let states = lychee.extend({}, data);


	this.blob = null;

	this._protected = false;

	this.__private  = {};


	this.setBlob(states.blob);
	this.setFlag(states.flag);

	states = null;

};

Composite.prototype = {

	setBlob: function(blob) {

		blob = blob instanceof Object ? blob : null;

		if (blob !== null) {

			this.blob = blob;

			return true;

		}


		return false;

	},

	setFlag: function(flag) {

		flag = typeof flag === 'boolean' ? flag : null;

		if (flag !== null) {

			this.flag = flag;

			return true;

		}


		return false;

	}

};
```

### Data Type Comparison

All methods accepting only specific data types have to use Ternaries in
order to validate the data type.

Always use literal data types for `Boolean`, `Number`, `String`, `RegExp`.
Always use a `===` (strict comparison) in the whole codebase.
Never use a `==` (abstract comparison).

- `===` (strict comparison) is used for `Boolean` and literal data types.
- `instanceof` is used for `Array`, `Function`, `Object`.
- `typeof` is used for `Number`, `String`.
- `!== undefined` is used for `Scope Object` (used to call a `Function` or `callback`).

```javascript
const _my_method = function(data, blob, flag, num, str, callback, scope) {

	data     = data instanceof Array        ? data      : null;
	blob     = blob instanceof Object       ? blob      : null;
	flag     = typeof flag === 'boolean'    ? flag      : null;
	num      = typeof num === 'number'      ? (num | 0) : null;
	str      = typeof str === 'string'      ? str       : null;
	callback = callback instanceof Function ? callback  : null;
	scope    = scope !== undefined          ? scope     : this;


	if (data !== null && blob !== null) {

		// ...
		return true;

	}


	return false;

};
```

All Data Types injected by the `bootstrap.js` file (and being used
in the [lychee.Asset](/libraries/crux/source/Asset.js) implementation)
are compatible with the `instanceof` operator.

- `instanceof` is used for `Config`, `Font`, `Music`, `Sound`, `Texture` and `Stuff`.
- `lychee.enumof()` is used for `Enum`.
- `lychee.interfaceof()` is used for `Interface` or `Composite`.

```javascript
const _MODE = {
	'default': 0,
	'woop':    1
};

const _my_method = function(config, service, mode) {

	config  = config instanceof Config                        ? config  : null;
	service = lychee.interfaceof(lychee.net.Service, service) ? service : null;
	mode    = lychee.enumof(_MODE, mode)                      ? mode    : _MODE['default'];


	if (config !== null && service !== null) {

		// ...

		return true;

	}


	return false;

};
```

### Data Type Validation

All Data Types are validated in positive-style branches. That means
each and every `Function` returns either always the same data type
or two opposite data types.

There are basically these variants on what a `Function` might return:

- `Object` or `null` is returned by a `Function` that gets data.
- `Array` is returned by a `Function` that filters data.
- `undefined` (nothing) is returned by a `Function` that updates or processes data asynchronously.
- `true` or `false` is returned by a `Function` that validates data or sets a state.

```javascript
const _CACHE    = [ 'foo', 'bar' ];
const _get_data = function() {

	if (_CACHE.length > 0) {
		return _CACHE[0];
	}


	return null;

};


const _filter_data = function(data) {

	let filtered = data.map(function(entry) {
		return entry.id.substr(0, 6) === 'lychee';
	});


	return filtered;

};


const _update_data = function(data) {

	data.forEach(function(entry) {
		entry.count++;
	});

};


lychee.Foo.prototype.setState = function(state) {

	state = typeof state === 'string' ? state : null;


	if (state !== null) {

		this.state = state;

		return true;

	}


	return false;

};
```

## Entity Layout

All lychee.js Entities and Definitions are divided in different Stacks.

Speaking of Entities (and not Definitions) always is about Entities that can be positioned in a Graph,
no matter if it's a Scene Graph (like `app` or `ui`) or a Timeline Graph (like `ai`, `net` or `verlet`).

All Entities follow simple guidelines in order to not conflict with other Entities if they are inherited
from. That means, custom logical behaviour that is not state-driven (like `setOptions(Array of String)`
that queries some entities in its own layer and sets their labels) is always abstracted away in a private
manner.

All Definitions and Entities use an `@` prefix if the `event` or `identifier` is used only internally.

So, for example, the `lychee.ui.Element` inherits from `lychee.ui.Layer` and has several defaulted entities.
It also has a `setOptions()` method that will will not accept entities, but accept `labels` which will be
set onto the matching internal entities. All those internal entities have an `@` prefix as an identifier,
so they will never conflict with other inheriting entities.

- All Entities have a `state` property (defaulted with `default` and `active`).
- All Entities have an `update()` and `render()` method.
- All Entities have all `attachments` that are required to integrate them via plug n' play.
- All `app` Entities can receive no events.
- All `ui` Entitites can receive events.
- All `ui` Entities inherit from the `lychee.event.Emitter` interface.
- All `net` Entities inherit from the `lychee.event.Emitter` interface.

A basic layout of an `Entity` looks like this:

```javascript
lychee.define('my.ui.Menu').includes([
	'lychee.ui.Select'
]).exports((lychee, global, attachments) => {

	const _Entity = lychee.import('lychee.ui.Entity');
	const _Select = lychee.import('lychee.ui.Select');
	const _FONT   = attachments["fnt"];



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = lychee.extend({}, data);


		this.state       = 'default';
		this.type        = 'awesome';

		this.__behaviour = 'not-awesome';


		this.setState(states.state);
		this.setType(states.type);

		delete states.state;
		delete states.type;


		states.font   = _FONT;
		states.width  = 256;
		states.height = 512;


		_Select.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('reshape', function(orientation, rotation, width, height) {

			this.width  = 1/4 * width;
			this.height = height;

			this.position.x = -1/2 * width + this.width / 2;
			this.position.y = 0;

		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (typeof blob.behaviour === 'string') {
				this.__behaviour = blob.behaviour;
			}

		},

		serialize: function() {

			let data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'my.ui.Menu';

			let states = data['arguments'][0];
			let blob   = (data['blob'] || {});


			if (this.type !== 'awesome') states.type = this.type;


			if (this.__behaviour !== 'not-awesome') blob.behaviour = this.__behaviour;


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		// Does not make sense, but it's awesome.
		setState: function(state) {

			state = typeof state === 'string' ? state : null;


			let result = _Select.prototype.setState.call(this, state);
			if (result === true) {

				this.__behaviour = 'awesome';

			} else {

				this.__behaviour = 'not-awesome';

			}


			return result;

		}

	};


	return Composite;

});
```

### Naming (Attachments)

Attachments are Asset instances (see [Definitions](#definitions) section) that are required for an Entity to work.

This can be all kinds of Assets, for example a `Sound` file or a `Texture` image.
If you want multiple attachments, please name them accordingly to their internal use or `state` of the Entity.

All attachments are mapped with their extension to the original Definition name.

- `app/source/ui/Bubble.js` is the Definition itself (`Stuff` instance).
- `app/source/ui/Bubble.json` is available via `(Config) attachments["json"]`.
- `app/source/ui/Bubble.png` is available via `(Texture) attachments["png"]`.
- `app/source/ui/Bubble.active.png` is available via `(Texture) attachments["active.png"]`.
- `app/source/ui/Bubble.msc.mp3` and `app/source/ui/Bubble.msc.ogg` are available via `(Music) attachments["msc"]`.
- `app/source/ui/Bubble.snd.mp3` and `app/source/ui/Bubble.snd.ogg` are available via `(Sound) attachments["snd"]`.


### Naming (Events)

Events are named accordingly to the `Scene Graph` or `Timeline Graph` integration.
Those events are `triggered` from either a `lychee.app.State` instance or any of the platform adapters (for example `lychee.Input`, `lychee.Viewport` or `lychee.net.Client`).

- All `ui` Entities have an optional `touch` event.
- All `ui` Entities have a `focus` event (`default` to `active` state) and a `blur` event (`active` to `default` state).
- All `ui` Entities have a `change` event if a user action can change their behaviour.
- All `ui` Entities have to have a `touch` event if they can receive `swipe` events.
- All `ui` Entities that can be focussed can then receive a `key` or `keymodifier` event.

