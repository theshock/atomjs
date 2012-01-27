/*
---

name: "Prototypes.Array"

description: "Contains Array Prototypes like include, contains, and erase."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- Types.Array

provides: Prototypes.Array

...
*/

(function () {

var proto = function (methodName) {
	return function () {
		var args = slice.call(arguments);
		args.unshift(this);
		return atom.array[methodName].apply(atom.array, args);
	};
};

atom.extend(Array, atom.array.collect( atom.array,
	'range from pickFrom fill fillMatrix collect create toHash'.split(' ')
));

atom.implement(Array, atom.array.associate(
	'randomIndex property contains include append erase combine pick invoke shuffle sortBy min max mul add sum product average unique associate clean empty clone hexToRgb rgbToHex'
		.split(' '), proto
));

atom.implement(Array, {
	get last(){
		return atom.array.last(this);
	},
	get random(){
		return atom.array.random(this, false);
	},
	popRandom: function () {
		return atom.array.random(this, true);
	},
	/** @deprecated */
	toKeys: function () {
		console.log( '[].toKeys is deprecated. Use forEach instead' );
		return atom.array.toKeys(this);
	},
	/** @deprecated */
	fullMap: function (callback, context) {
		console.log( '[].fullMap is deprecated. Use atom.array.create instead' );
		return atom.array.create(this.length, callback, context);
	}
});

if (!Array.prototype.reduce     ) Array.prototype.reduce      = proto('reduce');
if (!Array.prototype.reduceRight) Array.prototype.reduceRight = proto('reduceRight');

})();