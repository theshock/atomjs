/*
---

name: "Prototypes.Abstract"

description: "Contains office methods for prototypes extension."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom
	- Types.Array

provides: Prototypes.Abstract

...
*/

var prototypize = {
	fn: function (source) {
		return function (methodName) {
			return function () {
				var args = slice.call(arguments);
				args.unshift(this);
				return source[methodName].apply(atom.array, args);
			};
		};
	},
	proto: function (object, proto, methodsString) {
		atom.implement(object, atom.array.associate(
			methodsString.split(' '), proto
		));
		return prototypize
	},
	own: function (object, source, methodsString) {
		atom.extend(object, atom.array.collect( source, methodsString.split(' ') ));
		return prototypize
	}
};