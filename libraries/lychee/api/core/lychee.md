
= constructor

```javascript
lychee;
```

This implementation is a Module and has no constructor.

```javascript
console.log(lychee); // lychee core
```

#### Implementation Notes

The lychee core offers many functionalities that are
necessary across the whole Stack. These functions are
independent of platform-specific variants and
therefore are identical across all platforms.

As the [Definition](lychee.Definition) uses a mixin-based
inheritance system, there is currently no practical use
for ES6 modules and imports.

There are several Polyfills implemented in the lychee
core module that offer ES6 / ES7 functionality across
all platforms.

- `Array.prototype.find` returns a matching `(Array || Boolean || Date || Number || Object || String || null) value` to the `(Function) predicate` of the given `(Array) instance`.
- `Array.prototype.unique` returns a matching `(Array) values` to the `(Function) predicate` of the given `(Array) instance` which has unique `values`.
- `Boolean.prototype.toJSON` converts the `Boolean` data type to its raw `JSON value`.
- `Date.prototype.toJSON` converts the `Date` data type to its raw `JSON value`, which is the `ISO-8601 Date String`.
- `Number.prototype.toJSON` converts the `Number` data type to its raw `JSON value`.
- `Object.filter` returns a matching `(Array) values` to the `(Function) predicate` of the given `(Object) instance`.
- `Object.find` returns a matching `(Array || Boolean || Date || Number || Object || String || null) value` to the `(Function) predicate` of the given `(Object) instance`.
- `Object.keys` returns the `(Array) keys` of the given `(Object) instance`.
- `Object.sort` returns a sorted `Object` of the given `(Object) instance`.
- `Object.values` returns a `(Array) values` of the given `(Object) instance`.
- `String.prototype.toJSON` converts the `String` data type to its raw `JSON value`.
- `String.prototype.trim` trims leading and trailing whitespaces and returns the modified `String`.



= properties-debug

```javascript
(Boolean) lychee.debug;
```

The `(Boolean) debug` property is the flag that
determines if the current environment is being
debugged.

If set to `true`, it influences event
serialization and logging additional debug data
to the console.

```javascript
var env = new lychee.Environment({
	debug: true
});

lychee.setEnvironment(env);

environment.init(function(sandbox) {

	var lychee = sandbox.lychee;

	if (lychee.debug === true) {
		console.log('additional debug data');
	}

});
```



= properties-environment

```javascript
(lychee.Environment) lychee.environment;
```

The `(lychee.Environment) environment` property
has a back-reference to the currently active
environment.

The active environment is important for the
loading process of new Definitions and dependencies.

You can manually switch the environment and
isolate the loading process into it by calling
the [setEnvironment](#methods-setEnvironment)
method.

```javascript
var foo = new lychee.Environment({ id: 'foo' });
var bar = new lychee.Environment({ id: 'bar' });

lychee.setEnvironment(foo);
foo.init(function(sandbox) {

	console.log(sandbox.lychee.environment.id); // foo

	lychee.setEnvironment(bar);
	bar.init(function(sandbox) {
	
		// sandbox is now the sandbox of the isolated environment
		console.log(sandbox.lychee.environment.id);

	});

});
```



= properties-ENVIRONMENTS

```javascript
(Object) lychee.ENVIRONMENTS;
```

The `(Object) ENVIRONMENTS` property is a cache
that contains all previously loaded isolated
environments that were built for library usage.

The key is the unique identifier of the environment,
consisting of a `\*project\*/\*target\*` structure
to match the structure of the fertilizer (or build
system); for example `boilerplate/main` or
`harvester/dist`.

The environments are fertilized automatically into
the `/build/\*platform\*/\*target\*` folder of the
project or library.



= properties-ROOT

```javascript
(Object) lychee.ROOT;
```

The `(Object) ROOT` property is a cache that contains
the `root paths` of both the `project` and the `lychee`
library.

```javascript
lychee.ROOT.project; // '/opt/lycheejs/projects/boilerplate'
lychee.ROOT.lychee;  // '/opt/lycheejs'
```



= properties-VERSION

```javascript
(String) lychee.VERSION;
```

The `(String) VERSION` property is representing the
lycheeJS version. The lycheeJS version is built using
the year and quartal of the release, for example
`2015-Q4` or `2016-Q1`.



= methods-diff

```javascript
(Boolean) lychee.diff(aobject, bobject);
```

- `(Object) aobject` is an Object.
- `(Object) bobject` is an Object.

This method returns `true` if the objects are different and `false` if they are identical.

```javascript
var foo = { foo: 'bar' };
var bar = { foo: 'bar' };
var qux = { foo: 'foo' };

console.log(lychee.diff(foo, bar)); // false
console.log(lychee.diff(foo, qux)); // true
console.log(lychee.diff(bar, qux)); // true
console.log(lychee.diff(bar, foo)); // false
```



= methods-enumof

```javascript
(Boolean) lychee.enumof(template, value);
```

- `(Enum) template` is an object consisting of `(String) key` and `(Number) value`.
- `(Number) value` is representing the Enum data to verify.

```
var MY_ENUM = {
	'foo': 0,
	'bar': 1
};

console.log(lychee.enumof(MY_ENUM, MY_ENUM.foo)); // true
console.log(lychee.enumof(MY_ENUM, MY_ENUM.bar)); // true
console.log(lychee.enumof(MY_ENUM, 1337));        // false
```



= methods-extend

```javascript
(Object) lychee.extend(target [, object1, object2, ...]);
```

- `(Object) target` is the target object that will be extended with the properties of the other objects.

This method will extend the target object and iterate
over additional arguments in order to extend the
target object with their properties.

```javascript
var foo = { bar: 'qux' };
var bar = { qux: 'doo' };

var qux = lychee.extend({}, foo, bar);
console.log(qux); // { bar: 'qux', qux: 'doo' }

var doo = lychee.extend(foo, bar);
console.log(doo === foo); // true
console.log(foo); // { bar: 'qux', qux: 'doo' }
```



= methods-extendsafe

```javascript
(Object) lychee.extendsafe(target [, object1, object2, ...]);
```

- `(Object) target` is the target object that will be extended with the properties of the other objects.

This method will extend the target object and iterate
over additional arguments in order to extend the
target object with their properties.

The behavioural difference to [extend](#methods-extend)
is that this method only extends the target with the
properties if they are from the same type as the
target. So the target acts as a typed template.

```javascript
var foo = { bar: 'qux' };
var bar = { qux: 13.37 };
var tpl = { bar: 'str', qux: 1337  }

var qux = lychee.extendsafe({}, foo, bar);
console.log(qux); // {}

var doo = lychee.extendsafe(foo, bar);
console.log(doo === foo); // true
console.log(foo); // {}

var blu = lychee.extendsafe(tpl, foo, bar);
console.log(blu); // { bar: 'qux', qux: 13.37 }
```



= methods-extendunlink

```javascript
(Object) lychee.extendunlink(target [, object1, object2, ...]);
```

- `(Object) target` is the target object that will be extended with the properties of the other objects.

This method will extend the target object and iterate
over additional arguments in order to extend the
target object with their properties.

The behavioural difference to [extend](#methods-extend)
is that this method only extends the target with the
properties if they are from the same type as the
target. So the target acts as a typed template.

```javascript
var foo = { bar: 'qux' };
var bar = { qux: 13.37 };
var tpl = { bar: 'str', qux: 1337  }

var qux = lychee.extendsafe({}, foo, bar);
console.log(qux); // {}

var doo = lychee.extendsafe(foo, bar);
console.log(doo === foo); // true
console.log(foo); // {}

var blu = lychee.extendsafe(tpl, foo, bar);
console.log(blu); // { bar: 'qux', qux: 13.37 }
```



= methods-interfaceof

```javascript
(Boolean) lychee.interfaceof(template, instance);
```

- `(Class || Module) template` is the interface the instance is be validated against.
- `(Object) instance` is the instance that is validated.

This method returns `true` on success and `false` on failure.
It will match the API of the instance against the template.
It will check properties, enums and method names.

```javascript
var Foo = lychee.app.Entity;
var Bar = function() {};
Bar.prototype = { method: function() {} };

var qux = new Foo();
var doo = new Bar();

lychee.interfaceof(Foo, qux); // true
lychee.interfaceof(Foo, doo); // false
lychee.interfaceof(Bar, qux); // false
lychee.interfaceof(Bar, doo); // true
```



= methods-deserialize

```javascript
(Object || null) lychee.deserialize(data);
```

- `(Serialization Object) data` is the serialized
data of an instance that was created by a previous
[serialize](#methods-serialize) method call.

This method returns a `Serialization Object` on success and `null` on failure.
It will try to serialize the given definition.

The JSON structure for a `Serialization Object` has always the same specified
format. A serialized `Module` definition has to return a proper `reference`
while a serialized `Class` definition has to return a proper `constructor`.

```javascript
var data_ref = lychee.serialize(lychee.data.JSON);
var data_con = lychee.serialize(new lychee.Input({ key: true }));

console.log(data_ref); // { 'reference':   'lychee.data.JSON', 'arguments': []}
console.log(data_con); // { 'constructor': 'lychee.Input',     'arguments': [ { 'key': true }]}
```

```javascript
var data = lychee.serialize(new lychee.Input());

var instance = lychee.deserialize(data);
if (instance instanceof lychee.Input) {
	console.log('Success!', instance);
} else {
	console.log('Failure!', instance);
}
```
 


= methods-serialize

```javascript
(Serialization Object || null) lychee.serialize(definition);
```

- `(Object) definition` is the instance that is serialized.

This method returns a `Serialization Object` on success and `null` on failure.
It will try to serialize the given definition.

The JSON structure for a `Serialization Object` has always the same specified
format. A serialized `Module` definition has to return a proper `reference`
while a serialized `Class` definition has to return a proper `constructor`.

```javascript
var data_ref = lychee.serialize(lychee.data.JSON);
var data_con = lychee.serialize(new lychee.Input({ key: true }));

console.log(data_ref); // { 'reference':   'lychee.data.JSON', 'arguments': []}
console.log(data_con); // { 'constructor': 'lychee.Input',     'arguments': [ { 'key': true }]}
```

```javascript
var instance = new lychee.Input();

var data = instance.serialize();
if (data !== null) {
	console.log('Success!', data);
} else {
	console.log('Failure!', data);
}
```



= methods-define

```javascript
(lychee.Definition) lychee.define(identifier);
```

- `(String) identifier` is the unique identifier for the lychee.Definition.

This method returns a `lychee.Definition` instance.
It will currify the [exports](lychee.Definition#methods-exports)
method in order to define the definition in the
currently active [lychee.environment](#properties-environment).



= methods-import

```javascript
(Object || Function || null) lychee.import(reference);
```

- `(String) reference` is the unique reference for the `lychee.Definition` export.

This method returns an `Object` or `Function` on succes and `null` on failure.
It will try to resolve the `Module` or `Class`, dependent on the reference.

As every [lychee.Environment](#properties-environment) can be sandboxed, this method
tries to resolve the namespaces and instances to the sandboxed `global` scope.

```javascript
lychee.define('foo.Main').requires([
	'bar.Template',
	'qux.Other'
]).exports(function(lychee, global, attachments) {

	var bar      = lychee.import('bar');
	var qux      = lychee.import('qux');
	var Template = lychee.import('bar.Template');
	var Other    = lychee.import('qux.Other');

});
```



= methods-envinit

```javascript
(void) lychee.envinit(environment, profile);
```

- `(lychee.Environment) environment` is the initialized [lychee.environment](#properties-environment) instance.
- `(Object) profile` is the profile that is passed to the initialized `environment.build` instance.

This method returns nothing.
It will initialize the active [lychee.Environment](lychee.Environment)
instance which is reflected by the [lychee.environment](#properties-environment)
property.

```javascript
var env = new lychee.Environment({ /* ... */ });


lychee.envinit(env, {
	foo: 'bar'
});
```



= methods-pkginit

```javascript
(void) lychee.pkginit(identifier, settings, profile);
```

- `(String) identifier` is the unique identifier of the environment inside the `lychee.pkg` file.
- `(Object) settings` are the settings that are passed to the initialized [lychee.environment](#properties-environment) instance.
- `(Object) profile` is the profile that is passed to the initialized `environment.build` instance.

This method returns nothing.
It will initialize the active [lychee.Environment](lychee.Environment)
instance which is reflected by the [lychee.environment](#properties-environment)
property.

The environment settings are gathered by loading the [lychee.Package](lychee.Package) of the
current project and tracing `/build/environments/*identifier*` in the `lychee.pkg` file.

```javascript
lychee.pkginit('html/main', {
	debug:   true,
	sandbox: false
}, {
	foo: 'bar'
});
```



= methods-inject

```javascript
(Boolean) lychee.inject(environment);
```

- `(lychee.Environment) environment` is a [lychee.Environment](lychee.Environment) instance. If set to `null`, the original environment will be used.

This method returns `true` on success and `false` on failure.
It will inject the given environment into the active environment
and dispatch its [definitions](lychee.Environment#properties-definitions)
property.

```javascript
// This is the API for serialized environment snapshots in sandboxed builds
lychee.ENVIRONMENTS['lychee'] = new lychee.Environment({ /* ... */ });


var env = new lychee.Environment({ /* ... */ });

lychee.setEnvironment(env);                       // true
console.log(lychee.environment === env);          // true

lychee.inject(lychee.ENVIRONMENTS['lychee']);     // true, if preloaded
```



= methods-setEnvironment

```javascript
(Boolean) lychee.setEnvironment(environment);
```

- `(lychee.Environment) environment` is a [lychee.Environment](lychee.Environment) instance. If set to `null`, the original environment will be used.

This method returns `true` on success and `false` on failure.
It will set the active environment and dispatch its
[debug](lychee.Environment#properties-debug) property.

```javascript
var env = new lychee.Environment({ /* ... */ });

lychee.setEnvironment(env);                       // true
console.log(lychee.environment === env);          // true

lychee.setEnvironment({ not: 'an environment' }); // false
console.log(lychee.environment === env);          // false
```

