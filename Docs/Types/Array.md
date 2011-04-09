# Static Array methods

### range
	Array.range(Number from, Number to, Number step = 0);

Creates array of values from `from` to `to` with step `step`

	atom.log(Array.range(5, 8)); // [5,6,7,8]
	atom.log(Array.range(5, 15, 3)); // [5,8,11,14]

### from
	Array.from(arrayLikeObject);

Creates array from array-like object:

	Array.from(arguments);

### pickFrom
	Array.pickFrom(object);
Makes array from any object:

	Array.pickFrom(555); // [555],
	Array.pickFrom([1]); // [1]
	Array.pickFrom({});  // [ {} ]

### fill
	Array.fill(Array|number array, value)
Fill array `array`, or create new array with length `array` and fill it with values `value`

	Array.fill(3, null); // [null, null, null]

	var test = [1, 2, 3];
	Array.fill(test, 5);
	atom.log(test); // [5, 5, 5]

### collect
	Array.collect(object, Array properties, defaultValue = null)
Collect `properties` from `object` (or set `defaultValue` if empty)

	var object = { a: 5, b: 8, c: 13};
	atom.log( // [5, -1, 13]
		Atom.collect(object, ['a', 'x', 'c'], -1)
	);

### toHash
	Array.toHash(Array array)
Make hash from array-like object

	Array.toHash([1, 5, null]); // { 0: 1, 1: 5, 2: null } 

# Dynamic Array methods

### Array.contains(elem)

Checks if `elem` is present in `Array`

	[1,2,3].contains(1); // true