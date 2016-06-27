
# Codestyle Guide for lychee.js

1. [Project Layout](#project-layout)
  - [Packages](#packages)
  - [Namespaces](#namespaces)
  - [Definitions](#definitions)
2. [Definition Layout](#definition-layout)
  - [Modules](#modules)
  - [Classes](#classes)
  - [Callbacks](#callbacks)
3. [Code Layout](#code-layout)
  - [Editorconfig](#editorconfig)
  - [Indentation and Whitespaces](#indentation-and-whitespaces)
  - [Naming of Variables](#naming-variables)
  - [Naming of Properties and Methods](#naming-properties-and-methods)
  - [Data Type Comparison](#data-type-comparison)
  - [Data Type Validation](#data-type-validation)
4. [Entity Layout](#entity-layout)
  - [Naming of Attachments](#naming-attachments)
  - [Naming of Events](#naming-events)


## Project Layout

### Packages

The `lychee.pkg` file is divided in four sub-hierarchies that are tracked by the build system.

- `api` is the documentation folder that contains all documentation files of the package.
- `asset` is the asset folder that contains all raw assets that are automatically integrated by the Editor.
- `build` is the build variants folder that is produced by the fertilizer. The equivalent `build/environments` section in the package sets up automatically generated build variants of the library or application.
- `source` is the source variants folder that every developer can live-edit without any build tasks in between.


### Namespaces

Each subfolder located in `source` or `build` or `api` has to be written lowercase and is automatically mapped into its equivalent namespace. It may contain either Entities or other namespace folders.

Each namespace can be mapped as a tag that allows the implementation of platform-specific adapters. Examples are `lychee.Input`, `lychee.Renderer`, `lychee.Storage`, `lychee.Viewport` or the `lychee.net` Stack. Those Definitions are mapped in the `platform` tag and often have nearly identical feature-detecting `supports()` method calls.

An important mention here is that tags can inherit from other tags. Those inheriting sub-tags are using a dash (`-`) as a divider. For example, the `html-nwjs` tag inherits from `html` and reuses its components (if they are not overwritten).

Examples:
- `lychee/source/platform/html/Renderer` is equivalent to `lychee.Renderer`
- `lychee/source/platform/html-nwjs/Renderer` is equivalent to `lychee.Renderer`
- `lychee/source/platform/node/Renderer` is equivalent to `lychee.Renderer`


### Definitions

Each file located in `source` or `build` or `api` has to be written Uppercase and non-camelized and is automatically mapped into its equivalent namespace hierarchy and identifier. A Definition has the file suffix `.js`.

A Definition may have attachments. Those attachments are mapped by their file extension.

- `Buffer` for a generic binary buffer.
- `Config` for files with the `json`, `pkg` or `store` extension.
- `Font` for files with the `fnt` extension.
- `Music` for files with the `msc` extension.
- `Sound` for files with the `snd` extension.
- `Texture` for files with the `png` extension.

The identifier for each Definition has to be uppercase and not camelized. If there's an additional `.` in the filename it is automatically mapped as an Attachment to the Definition.


Examples:

- `lychee/source/data/JSON.js` is equivalent to `lychee.data.JSON`
- `lychee/source/platform/html/data/JSON.js` is equivalent to `lychee.data.JSON`
- `lychee/source/Foo.js` and `lychee/source/Foo.default.png` and `lychee/source/Foo.fancy.png` is equivalent to `lychee.Foo` with `attachments = { "default.png": (Texture), "fancy.png": (Texture)}`.


## Definition Layout

The lychee.js Definition system always uses so-called Definition closures in order to have advanced memory functionality among different instances. A basic layout of a Definition has (if the functionality is required) these sections:

- HEAD
  - `lychee.define(identifier)`
  - `.tags()`
  - `.requires()`
  - `.includes()`
  - `.attaches()`
  - `.supports()`
  - `.exports()`
- BODY (inside `.exports(function() { /* BODY */ })`)
  - `FEATURE DETECTION` section
  - `HELPERS` section
  - `IMPLEMENTATION` section
  - `ENTITY API` section
  - `CUSTOM API` section
  - return of `Class`, `Module` or `Callback`

An important mention here is that three Definition types supported:

- `Module` is a singleton that has only properties and methods, but no prototype. Its `deserialize()` call returns a `reference`.
- `Class` is a dynamic class implementation with public methods on its prototype. It is called using the `new <Definition>()` keyword. Its `deserialize()` call returns a `constructor`.
- `Callback` is a simple function that can not be called with the `new` keyword. Its `deserialize()` call returns a `reference`.



### Modules

A basic layout of a `Module` looks like this:

```javascript
lychee.define('my.ENCODER').requires([
	// optional requirements
	'my.Other'
]).exports(function(lychee, my, global, attachments) {

	var _Other = my.Other;



	/*
	 * HELPERS
	 */

	var _encode = function(data) {
		return null;
	};

	var _decode = function(data) {
		return null;
	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {

		/*
		 * ENTITY API
		 */

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



### Classes

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
]).supports(function(lychee, global) {

	// optional feature detection
	if (typeof global.addEventListener === 'function') {
		return true;
	}

	return false;

}).exports(function(lychee, my, global, attachments) {

	var _Other         = my.Other;
	var _shared_memory = [];



	/*
	 * HELPERS
	 */

	var _do_fancy_stuff = function() {

		for (var s = 0, sl = _shared_memory.length; s++) {
			_shared_memory[s].update(); // stub API for demo usage
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.custom = null;


		this.setCustom(settings.custom);


		// This order has to be identical to lychee.Definition.prototype.includes() call
		lychee.game.Entity.call(this, settings);
		lychee.event.Emitter.call(this);


		_shared_memory.push(this);

		settings = null;

	};


	Class.prototype = {

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


	return Class;

});
```



### Callbacks

```javascript
lychee.define('my.Definition').exports(function(lychee, my, global, attachments) {

	var _device = null;



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

	var Callback = function() {

		return _device; // stub API for demo usage

	};


	return Callback;

});
```



## Code Layout

### Editorconfig

There's an `.editorconfig` file in the lychee.js root and you have to use it.
Use `Tab` and NOT whitespaces. Our `Tab` is equivalent to `4 Whitespaces`.

```javascript
// GOOD
var data = _CACHE[id];
if (data !== null) {
    data.load(); // data is all in the same column.
}

// BAD
var data = _CACHE[id];
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
var y = 15;
var x = 3 * 4 + (y / 3);

// BAD
var y=15;
var x=3*4+(y/3);
```


One empty line is necessary when there's either a new condition
(if/else/switch) or a block of statements with more than 2 lines
of code.

```javascript
var data = _CACHE[id] || null;
if (data !== null) {

    data.onload = function() {

        var buffer = this.buffer;
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
var _my_method = function(data) {

    if (data !== null) {

        var filtered = [];

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

As in ES5 / ES6 all variables are basically references in terms of
classical programming languages, there's a necessity of using
uppercase / lowercase names for variables to easily figure out
the memory layout and behaviour of those.

- Static variables and Enums are completely written uppercase.
- Shared variables between multiple instances have a prefixed underscore.
- Constructors are written uppercase-first.
- Instances are written lowercase.
- Namespaces are written lowercase (as they are Object instances in ES5 / ES6).


```javascript
var _Entity = lychee.app.Entity;
var _CACHE  = {};

var Constructor = function(settings) {

    this.entity = new _Entity(settings);

    _CACHE.push(this);

};


var foo = new Constructor({ woop: true });
var bar = new Constructor({ woop: true });
```

As `lychee.define` or `new lychee.Definition()` uses a Definition
closure, you have full advantages of using shared and static variables
within the Definition closure. Shared variables all have to be assigned
at the top (See above section Class Definition Layout).


### Naming (Properties and Methods)

Properties of Classes and Modules are named accordingly to their visibility.

- Public properties are written lowercase.
- Protected properties are written lowercase and have a prefixed underscore.
- Private properties are written lowercase and have two prefixed underscores.
- If there's a public property with `name`, there has to exist a `setName` method on the prototype.
- The return value of a `setName` method always has to be `true` or `false`.
- The `setName` method is always called in the `Constructor`, so that it accepts a `settings[name]` value.

```javascript
var Class = function(data) {

    var settings = lychee.extend({}, data);


    this.blob = null;

    this._protected = false;

    this.__private  = {};


    this.setBlob(settings.blob);
    this.setFlag(settings.flag);

};

Class.prototype = {

    setBlob: function(blob) {

        blob = blob instanceof Object ? blob : null;

        if (blob !== null) {

            this.blob = blob;

            return true;

        }


        return false;

    },

    setFlag: function(flag) {

        if (flag === true || flag === false) {

            this.flag = flag;

            return true;

        }


        return false;

    }

};
```

Events are an exception, they have three prefixed underscores internally
to be available across all `lychee.Definition` instances without any conflicts.


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
var _my_method = function(flag, data, blob, num, str, callback, scope) {

    flag     = flag === true;
    data     = data instanceof Array        ? data      : null;
    blob     = blob instanceof Object       ? blob      : null;
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
in the `lychee.Asset` implementation) are compatible with the
`instanceof` operator.

- `instanceof` is used for `Config`, `Font`, `Music`, `Sound`, `Texture` and `Stuff`.
- `lychee.enumof()` is used for `Enum`.
- `lychee.interfaceof()` is used for `Interface` or `Class`.

```javascript
var _MODE = {
    'default': 0,
    'woop':    1
};

var _my_method = function(config, service, mode) {

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
var _CACHE    = [ 'foo', 'bar' ];
var _get_data = function() {

	if (_CACHE.length > 0) {
		return _CACHE[0];
	}


	return null;

};


var _filter_data = function(data) {

	var filtered = data.map(function(entry) {
		return entry.id.substr(0, 6) === 'lychee';
	});


	return filtered;

};


var _update_data = function(data) {

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
]).exports(function(lychee, global, attachments) {

	var _font = attachments["fnt"];



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.state       = 'default';
		this.type        = 'awesome';

		this.__behaviour = 'not-awesome';


		this.setState(settings.state);
		this.setType(settings.type);

		delete settings.state;
		delete settings.type;


		settings.font   = _font;
		settings.width  = 256;
		settings.height = 512;


		lychee.ui.Select.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('reshape', function(orientation, rotation, width, height) {

			this.width  = 1/4 * width;
			this.height = height;

			this.position.x = -1/2 * width + this.width / 2;
			this.position.y = 0;

		}, this);


		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (typeof blob.behaviour === 'string') {
				this.__behaviour = blob.behaviour;
			}

		},

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'my.ui.Menu';

			var settings = data['arguments'][0];
			var blob     = (data['blob'] || {});


			if (this.type !== 'awesome') settings.type = this.type;


			if (this.__behaviour !== 'not-awesome') blob.behaviour = this.__behaviour;


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		// Does not make sense, but it's awesome.
		setState: function(state) {

			state = typeof state === 'string' ? state : null;


			var result = lychee.ui.Select.prototype.setState.call(this, state);
			if (result === true) {

				this.__behaviour = 'awesome';

			} else {

				this.__behaviour = 'not-awesome';

			}


			return result;

		}

	};


	return Class;

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

