
# TODO

- Expressions
- Statements (if/else, switch/case, for, for/in, for/of, while, do/while)
-- Declarations (var, let, const)
-- Others (debugger, export, import, label)


# ECMAScript Guide for lychee.js Developers

## Introduction

In lychee.js, we use ES5 (JavaScript or ECMAScript version 5) as
the code language with some approaches of the ES6 world. This guide
aims to be a shorthand lookup guide for developers worrying about how
to solve problems in ES5 or ES6.

It can also be seen as a sort of cheat sheet that tells you what
different features are and how they affect the VM (Virtual Machine).

There are several reasons (from isomorphic and feature-detection
standpoint) that won't allow us to easily switch completely to ES6.
An example is that ES6 Modules are defined as per-file basis (which
is terribly bad because there's no language-level API across all
runtimes to simulate file i/o). ES6 classes are also not allowing our
mixin-based inheritance behaviour that is injectable at runtime.

ES6 Proxies are up to come, when they are ready we will use them to
improve our intelligent environment sandboxes (`lychee.Definition.exports()`).

ES6 Generators won't make sense in our engine stack as we use sandboxed
closures for each serializable definition anyways.

This allows us to replace and inject code for debugging at runtime
and not initialization time and gives us a heavy advantage with
advanced debugging (Editor) and simulation (AI integration) features
that are not reproducible with ES6 features themselves.

This guide focusses on Google's V8, but the Monkey variants of Mozilla
and Chakra from Microsoft share similar methodologies. There might be
varying performance among the VMs, but the optimization process itself
is pretty much the same as far as available code can tell.



## Data Types

In ES5, there are primarily two different data type behaviours,
`Literals` and `Instances`.

Literals are the short notation of data types, which means they
have a pretty-much identical behaviour in arithmetics, but not
when it comes to an instance-dependent API.

Instances on the other hand are unique. That means both a comparison
(`==`) and a deep equals comparison (`===`) will lead to `false`
when trying to compare identical object instances, as hidden classes
will prevent that behind the scenes.

```javascript
var foo = { qux: 'abc' };
var bar = { qux: 'abc' };

foo == bar;  // false
foo === bar; // false
```

Hidden Classes are basically the implementation in the VM that
prevents messing up the memory. So each optimized variant of each
dynamically typed data type will lead to a new hidden class (if
there's none identical there already). As object instances with
same properties can be enumerated in different orders, different
order of properties will also lead to different hidden classes.

```javascript
var foo = { x: 13, y: 37 }; // first hidden class
var bar = { y: 13, x: 37 }; // second hidden class because of y,x order
var qux = { x: 13, y: 37 };

qux.z = 'str'; // third hidden class because of external property

for (prop in foo) {
	// prop order is x, y
}

for (prop in bar) {
	// prop order is y, x
}
```



### Primitives

Primitives in ES5 are described as data types that are
allocated at runtime and won't be traced by the Garbage Collector
runs later. In ES5, the Primitive data types are `Boolean`,
`Number`, `Null` and `Undefined`.

```javascript
var flag = true;
var x    = 13.37;
var y    = null;
var z;  // undefined
```



### Strings and Regular Expressions

Strings and Regular Expressions are also treated as Primitives
and are primarily handled in runtime memory. But they have
VM-internal Symbols, so that the VM can re-use given allocations
quicker for identical Instances (Hidden Class Instances) again.

```javascript
var foo = 'abc';
var bar = new String('abc');

foo.length;            // is available
foo instanceof Object; // true
bar.length;            // is available
bar instanceof Object; // true

var qux = /Artificial\sEngineering/g;
var doo = new RegExp('Artificial\sEngineering', 'g');

qux.toString();        // is available
qux instanceof Object; // true
doo.toString();        // is available
doo instanceof Object; // true

/abc/g != /abc/g;
typeof (/abc/g).valueOf(); // 'object'
```



### Literals and Instances

As mentioned before, there's a difference in the behaviour of
`Literals` versus the behaviour of `Instances`.

All `new` calls result in Object instances, no matter if they were
called on an Expression or a Function Template.

```javascript
var foo = new Number(123);
var bar = 123;

typeof foo === 'number'; // true
foo instanceof Object;   // true

typeof bar === 'number'; // true
bar instanceof Object;   // false

foo + bar; // 246
```

`Array Literals` and `Object Literals` are different from the
Primitive data types. These two directly allocate heap memory and
need to be cleared up by the Garbage Collector.

```javascript
var foo = [ 1, 3, 3, 7 ];
var bar = { qux: 'doo' };

foo instanceof Array;  // true
foo instanceof Object; // true

bar instanceof Object; // true
```



### Conversion and Unboxing of Arrays

As ES5 is dynamically typed, there's a so-called unboxing process
that results in deoptimization of Arrays. They are crashing, the
compiled assembly branches are flagged as invalid in the VM, the
array is unboxed, analysed and boxed again with a different data
type.

The different data type can in worst-case result in a Pointer Array
that points to the Object Instance memory and therefore introduces
another meta-level of Pointers. Variables in ES5 are nothing more
than References / Pointers, but we'll dig into that later.

```javascript
var foo = [ 13, 37, 0.5, true ]; // No unboxing necessary, analysed at compile time
var bar = new Array();

bar[0] = 13;   // allocate
bar[1] = 37;   // allocate
bar[2] = 0.5;  // allocate and convert to Doubles (64 Bit)
bar[3] = true; // allocate and convert to Objects and Unboxing of Array (new meta-level of Pointers)
```



### Hidden Classes

As ES5 is dynamically typed, there are so-called Hidden Classes that
optimize your code and memory behind the scenes. These Hidden Classes
are not accessible from your code and only available internally in
each VM.

All object instances are unique, so you can imagine that they have
an internal property that has something like an identifier. Both
examples here share the same Hidden Class behind the scenes.

```javascript
var _id = 0;

Object = function(properties) {

	this._id = _id++; // imaginary unique id property

	for (var p in properties) {
		this[p] = properties[p];
	}

};


var foo = { bar: 'qux' }; // imaginary foo._id == 1
var bar = { bar: 'qux' }; // imaginary foo._id == 2

foo == bar;  // false
foo === bar; // false
```

If you have a different property order or different property types,
it will result in a different Hidden Class.

```javascript
var foo = { x: 13, y: 37 };  // first Hidden Class
var bar = { x: 13, y: 37 };  // first Hidden Class
var qux = { x: 13, y: 3.7 }; // second Hidden Class
var doo = { y: 13, x: 37 };  // third Hidden Class
```

Setting external properties also lead to a different Hidden Class if
the property was not existing before. Same as before, if you change
the type it also leads to a different Hidden Class.

```javascript
var Point = function(x, y) {
	this.x = x;
	this.y = y;
};

var foo = new Point(13, 37);   // first Hidden Class
var bar = new Point(37, 13);   // first Hidden Class
var qux = new Point(37, '13'); // second Hidden Class

var doo = new Point(13, 37); // first Hidden Class
doo.z = 1337;                // converted to third Hidden Class
```



## Custom Data Types

Basically data types are determined by two methods:
`valueOf()` for determination of the arithmetic value and `toString()`
for String conversion of Instances. There is a third optional method
`toJSON()` that is implemented across most VMs, this one is only used
by the `JSON.stringify(object)` method, if it's available.

Let's assume we want to figure out how to implement a Vector data
type in ES5. Don't get too much confused by the `prototype`, how this
works is explained later.

The arithmetic value is determined by the `valueOf()` method. If this
method returns `Null`, it is assumed that the Instance has no
arithmetic value of any kind.

```javascript
var Vector = function(x, y) {
	this.x = x;
	this.y = y;
};

Vector.prototype = {
	valueOf: function() {
		return null; // No arithmetic value!
	}
};

var foo = new Vector(13, 37);
var bar = new Vector(13, 37);
var qux = 123;

foo + bar; // null + null = 0
foo + qux; // null + 123  = 123
qux + foo; // 123  + null = 123
```

If the `valueOf()` method returns a `Number`, it is assumed that the
Instance has an arithmetic value.

```javascript
var Vector = function(x, y) {
	this.x = x;
	this.y = y;
};

Vector.prototype = {
	valueOf: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
};

var foo = new Vector(13, 37);
var bar = new Vector(13, 37);
var qux = 123;

foo + 0;   // 39.21734310225516
foo + bar; // 78.43468620451031

foo + 'str'; // '39.21734310225516str'
'str' + foo; // 'str39.21734310225516'
```

If the `valueOf()` method returns an `Object Instance`, it is assumed
that the Instance has no arithmetic value. If an Instance has no
arithmetic value, it is automatically converted to a `String` using
the `toString()` method.

```javascript
var Vector = function(x, y) {
	this.x = x;
	this.y = y;
};

Vector.prototype = {
	valueOf: function() {
		return {}; // No arithmetic value, but needs conversion
	},
	toString: function() {
		return '[object Vector]';
	}
};

var foo = new Vector(13, 37);
var bar = new Vector(13, 37);
var qux = 123;

foo + 0;   // '[object Vector]0'
foo + bar; // '[object Vector][object Vector]'
bar + foo; // '[object Vector][object Vector]'

foo + qux; // '[object Vector]123'
qux + foo; // '123[object Vector]'
```



## Functions

In ES5, there are many factors that influence how a Function or an
Object Instance is built.



### Prototypes

Prototypes are similar to Smart Pointers in C++. They don't behave
the same way as in classical Object-Oriented Programming languages,
because the prototype needs to link to an Object Instance, not to
an Object Interface.

In most ES5 VMs there is a `__proto__` property available on all
Object Instances. This property can lookup the prototype chain upwards
to the `Super Instance` where the Instance is inheriting from.

```javascript
var Vector = function(x, y) {
	this.x = x;
	this.y = y;
};

Vector.prototype = {};


var foo = new Vector(13, 37);

foo instanceof Vector; // true
foo.__proto__;         // Vector.prototype

foo instanceof Object;   // true
foo.__proto__.__proto__; // Object.prototype

foo instanceof Function;         // false
foo.__proto__.__proto__.__proto; // null

Vector instanceof Function; // false
Vector.__proto__;           // Function.prototype
```

In ES5.1 the `Object.getPrototypeOf()` method is available that
fullfills the identical task as the non-standard `__proto__`
property on Object Instances.

```javascript
var proto  = {};
var object = Object.create(proto);

Object.getPrototypeOf(object) === proto; // true
```

Prototypes are shared memory across different Instances of the same
Function Template. That means each Prototype points to another Object
Instance, not a Function Template.

The following Entity example has an incorrectly linked Prototype,
therefore it is not an Instance of Vector.

```javascript
var Vector = function(x, y) {};

Vector.prototype = {
	length: function() {}
};

var Entity = function(x, y) {};
Entity.prototype = Vector.prototype; // Incorrect linking


var foo = new Entity(13, 37);

foo instanceof Vector;                           // false
typeof foo.length;                               // 'function'
Object.getPrototypeOf(foo) instanceof Vector;    // false
Object.getPrototypeOf(foo) === Vector.prototype; // true
```

Each Prototype of an Instance always has to link to an Object
Instance, not a Function Template. That means Prototypes in ES5 are
different from classes and their shared methods in classical
Object-Oriented Programming languages, because they require an
Instance, not an Interface that they are linked to.

That means the `Instance instanceof Template` operator in ES is
equivalent with a check if the Prototype of the Prototype of the
Instance is the Prototype of the Template.

```javascript
var Vector = function(x, y) {};

Vector.prototype = {
	length: function() {}
};

var Entity = function(x, y) {};
Entity.prototype = new Vector(); // Correct linking


var foo = new Entity(13, 37);

foo instanceof Vector;                                                  // true
typeof foo.length;                                                      // 'function'
Object.getPrototypeOf(foo) instanceof Vector;                           // true
Object.getPrototypeOf(Object.getPrototypeOf(foo)) === Vector.prototype; // true
```



### Function Scopes

In ES5, there are only Function Scopes available using the `var`
keyword. Each variable is available to its Definition Scope. If a
variable is accessed in a sub-Scope, it is accessed from an outer
Scope if it was not bound to its own Scope before.

```javascript
var foo   = { x: 0, y: 0 };
var inner = function() {
	foo.x++; // This modifies the foo reference from the outer Scope
};

foo.x; // 0
inner();
foo.x; // 1
```

A concept inside ES5 is `Hoisting`. Hoisting means that variables can be
declared after they have been used already. All Function Scopes are
parsed initially. The parser looks up all used references and stacks
them together to the most-top of the Function Scope, so that they can be
used, even if there was no preceding `var` keyword for that reference.

```javascript
var outer = function() {

	x = 5; // valid statement
	var x;

	return x;

};

outer(); // 5, not undefined
```


This example modifies the `bar` reference from the outer Scope, which
is bound by the Closure as the `foo` reference.

```javascript
var foo = { x: 0, y: 0 };
var bar = { x: 0, y: 0 };

var outer = function(foo) {
	foo.x++; // This modifies the bar reference from outer Scope
};

foo.x; // 0
bar.x; // 0

outer(bar);

foo.x; // 0
bar.x; // 1
```

As this stuff can get quite complicated, you should always remember
to bind references accordingly. Never ever name them the same way as
outer references, otherwise your code will be very hard to read.

```javascript
var foo = { x: 0, y: 0 };
var bar = { x: 0, y: 0 };

// Never write such code. It is BAD. REALLY bad.

var outer = function(bar, qux) {

	bar.x++;

	var inner1 = function(qux) {
		qux.y++;
	};

	var inner2 = function() {
		this.x++;
	}.bind(bar);

	inner1(bar);
	inner1(qux);

	inner2(bar);
	inner2(qux);

};

outer(foo, bar);

foo; // { x: 3, y: 1 }
bar; // { x: 0, y: 1 }
```

Variable declarations, whereever they occur, are processed before
any code is executed. The scope of a variable declared with var
is its current `execution context` which is either the enclosing
function or, for variables declared any function, global.

```javascript
var foo = 3;

(function() {

	bar; // undefined
	foo++;

	var bar = 1;
	for (var x = 0; x < 10; x++) {
		bar++;
	}

	x;   // 9
	bar; // 10

	foo;   // 4
	bar++; // 11

})();
```



### Block Scopes

In ES6, there are Block Scopes available using the `let` or `const`
keyword. Each variable is available only to its Definition Scope
and cannot be resolved outside its own Block Scope.

The `let` statement declares a block scope local variable,
optionally initializing it to a value. It allows to declare
variables that are limited to the block, statement or
expression on which it is used.

This behaviour is unlike the `var` keyword, which defines
a variable globally, or locally to an entire function
regardless of the block scope.

```javascript
var outer = function() {

	var leak = 13;
	if (true) {
		var leak = 37; // same reference!
		leak;          // 37
	}

	leak; // 37

	let noleak = 13;
	if (true) {
		let noleak = 37; // different reference!
		noleak;          // 37
	}

	noleak; // 13

};

outer();
```

The `const` statement creates a read-only reference to a value.
That means the value it holds cannot be reassigned, the value
itself can still be mutable. It creates a constant that can
either be global or local to the function in which it is
declared.

An initializer for a constant is required. That means it is
necessary to specify the value in the same statement in which
it was declared. Constants are block-scoped like variables defined
using the `let` statement.

```javascript
const MY_FOO = 1337;
const MY_BAR = { qux: 13, doo: 37 };

MY_FOO = 13.37;       // This fails silently
MY_BAR = { qux: 13 }; // This fails silently


const MY_FOO = 13.37; // throws an Error
MY_BAR.qux   = 13.37; // Object properties are not protected, so this works
```



### Function Contexts

Functions are always executed in a specific Function Context. By
default, all Functions are executed in their own Execution Scope.

If a method is called on an Object Instance, the `this` keyword
refers to the Object Instance itself. If a method is not called
on an Object Instance, `this` is a temporary Scope that gets
destructed afterwards and is then not available anymore.

In ES5, there are three essential methods on the Function Prototype
to work with Function Contexts.

`Function.prototype.bind()` binds a Function in a specific Context,
so if it is called with a different Scope later, the `this` keyword
will reference to the bound Context.

But if a `new` Object Instance was created using that Function
Template, it will lead to a unique Scope (as Object Instances in ES
are always unique).

```javascript
var foo = { x: 0 };
var bar = function() {
	this.x++;
}.bind(foo);

bar();
foo.x; // 1

bar.call({});
foo.x; // 2

new bar(); // { x: NaN }
foo.x;     // 2
```

`Function.prototype.call()` calls a Function in a specific Context,
assuming the Arguments as additional Parameters.

```javascript
bar = 0; // global property

var foo = function(val) {
	this.bar += val;
	return this;
};


foo(13);         // global
this === global; // true
this.bar;        // 13

new foo(37);     // { bar: NaN }

var qux = { bar: 13 };
foo.call(qux, 37) === qux; // true
qux;                       // { bar: 50 }
```

`Function.prototype.apply()` calls a Function in a specific Context,
assuming the Arguments Array as the second Parameter.

```javascript
bar = 0; // global property

var foo = function(val1, val2) {
	this.bar += val1;
	this.bar += val2;
	return this;
};


foo(13, 37);     // global
this === global; // true
this.bar;        // 50

new foo(13, 37); // { bar: NaN }

var qux = { bar: 1337 };
foo.apply(qux, [ 13, 37 ]) === qux; // true
qux;                                // { bar: 1387 }
```



### Function Closures

As ES is a primarily a language used with Function Scopes, there
might occur problems when doing Iteration Loops and using the
Iterator inside it.

In the following example, all Items will have the identical
identifier, because the `onload` callback is fired when the `a`
already has the value of the last Iteration State - in this case
the value `2`.

```javascript
var array = [ {}, {}, {} ];

for (var a = 0, al = array.length; a < al; a++) {

	var item = new Item();

	item.setObject(array[a]); // correct (sync) a
	item.onload = function() {
		this.identifier = a;  // incorrect (async) a
	};
	item.load();

}
```

A way to solve this problem is by using the `Closure` mechanics
and using an Immediately Invoked Function Expression (`IIFE`) that
binds the corresponding variables into a new Function Context.

```javascript
var array = [ {}, {}, {} ];

for (var a = 0, al = array.length; a < al; a++) {

	var item = new Item();

	item.setObject(array[a]); // correct (sync) a

	(function(a) {

		item.onload = function() {
			this.identifier = a; // correct (invoked) a
		};

	})(a);

	item.load();

}
```

Another way to solve this problem is by using a `Wrapper Function`
that, similar to the `IIFE` method, binds the Parameters as Arguments
inside its own Context.

```javascript
var _bind_item = function(item, object, a) {

	item.setObject(object);  // correct (bound) a
	item.onload = function() {
		this.identifier = a; // correct (bound) a
	};

};


var array = [ {}, {}, {} ];

for (var a = 0, al = array.length; a < al; a++) {

	var item = new Item();

	_bind_item(item, array[a], a);

	item.load();

}
```

