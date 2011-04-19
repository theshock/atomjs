Atom Core
=========

## atom.extend(object = atom, from)

Extend `object` with `from` properties.

#### Example: config
	config = atom.extend({
		// default values for config
		a : 15,
		b : 20
	}, config);

#### Example: extending atom
	atom.extend({
		value: 123
	});
	alert(atom.value); // 123


## atom.implement(object = atom, from)

Extend `object.prototype` with `from` properties.

#### Example: class extends
	atom.implement(child, parent);

#### Example: expanding atom
	atom.implement({
		test: function () {
			alert(123);
		}
	});
	var a = atom();
	a.test(); // 123

## atom.toArray(arrayLikeObject)

Cast `arrayLikeObject` to `Array`
	var args = atom.toArray(arguments);

## atom.log(arg1, [arg2, ...])

Safe alias for `console.log`

## atom.clone(object)
Returns clone of object
	var cloneArray = atom.clone(oldArray);

## atom.typeOf(object)
Returns type of object:

	atom.typeOf( document.body ) == 'element'
	atom.typeOf(  function(){} ) == 'function'
	atom.typeOf(    new Date() ) == 'date'
	atom.typeOf(          null ) == 'null'
	atom.typeOf(     arguments ) == 'arguments'
	atom.typeOf(        /abc/i ) == 'regexp'
	atom.typeOf(            [] ) == 'array'
	atom.typeOf(            {} ) == 'object'
	atom.typeOf(            15 ) == 'number'
	atom.typeOf(          true ) == 'boolean'

	var MyClass = atom.Class({});
	atom.typeOf( new MyClass() ) == 'class'

JavaScript 1.8.5 Compatiblity
=============================

Browsers, which do not have JavaScript 1.8.5 compatibility, will get those
methods implemented:

* [Function.prototype.bind](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind)
* [Object.keys](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys)
* [Array.isArray](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray)
