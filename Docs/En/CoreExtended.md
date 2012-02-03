Atom Extended Core
==================

## atom.extend(object = atom, from)

Extend `object` with `from` properties.

#### Example: config
	config = atom.core.extend({
		// default values for config
		a : 15,
		b : 20
	}, config);

#### Example: extending atom
	atom.core.extend({
		value: 123
	});
	alert(atom.value); // 123


## atom.core.implement(object = atom, from)

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