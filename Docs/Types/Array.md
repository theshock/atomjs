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

### contains
	array.contains(elem)
Tests an array for the presence of an item.

	[1,2,3].contains(1); // true

### include
	array.include(elem)
Pushes the passed element into the array if it's not already present (case and type sensitive).

	[1,2,3].include(1); // [1,2,3]
	[1,2,3].include(4); // [1,2,3,4]

### append
	array.append(Array array1, Array array2 ...)

Appends the passed array to the end of the current array.

	var myOtherArray = ['green', 'yellow'];
	['red', 'blue'].append(myOtherArray); // returns ['red', 'blue', 'green', 'yellow'];
	myOtheArray; // is now ['red', 'blue', 'green', 'yellow'];

	[0, 1, 2].append([3, [4]]); // [0, 1, 2, 3, [4]]

### erase
	array.erase(item);
Removes all occurrences of an item from the array.

	[1,2,3,1].erase(1); // [2,3]

### toKeys
### combine
### last
### random
### pick
### invoke
### shuffle
### sortBy
### min
### max
### average
### sum
### unique
### associate
### clean
### empty
### clone
### hexToRgb
### rgbToHex