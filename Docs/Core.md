JavaScript 1.8.5 Compatiblity
=============================

Browsers, which do not have JavaScript 1.8.5 compatibility, will get those
methods implemented:

* [Function.prototype.bind](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind) d</li>
* [Object.keys](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys) </li>
* [Array.isArray](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray)
*

Atom Core
=========

## atom.extend(object = atom, safe = false, from)

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

#### Example: safe extending
	// extend Array with .contains property if not implemented yet
	atom.extend(Array, 'safe', {
		contains: function (elem) {
			return this.indexOf(elem) >= 0;
		}
	});


## atom.implement(object = atom, safe = false, from)

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

#### Example: extend Function with .bind property if not implemented yet
	atom.implement(Function, true, { bind : function () { /* code */} });

## atom.toArray(arrayLikeObject)

Cast `arrayLikeObject` to `Array`
	var args = atom.toArray(arguments);

## atom.log(arg1, [arg2, ...])

Safe alias for `console.log`

## atom.isAtom(object)

Checks if `object` is Atom instance
	atom.isAtom(atom()); // true

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
