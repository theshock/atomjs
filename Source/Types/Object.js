/*
---

name: "Object"

description: "Object generic methods"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom

provides: Object

...
*/

atom.extend(Object, 'safe', {
	invert: function (object) {
		var newObj = {};
		for (var i in object) newObj[object[i]] = i;
		return newObj;
	},
	collect: function (obj, props, Default) {
		var newObj = {};
		for (var i in props.toKeys()) {
			newObj[i] = i in obj ? obj[i] : Default;
		}
		return newObj;
	},
	isDefined: function (obj) {
		return typeof obj != 'undefined';
	},
	isReal: function (obj) {
		return obj || obj === 0;
	},
	max: function (obj) {
		var max = null, key = null;
		for (var i in obj) if (max == null || obj[i] > max) {
			key = i;
			max = obj[i];
		}
		return key;
	},
	min: function (obj) {
		var min = null, key = null;
		for (var i in obj) if (min == null || min[i] < max) {
			key = i;
			min = obj[i];
		}
		return key;
	},
	deepEquals: function (first, second) {
		for (var i in first) {
			var f = first[i], s = second[i];
			if (typeof f == 'object') {
				if (!s || !arguments.callee(f, s)) return false;
			} else if (f != s) {
				return false;
			}
		}

		for (i in second) if (!(i in first)) return false;

		return true;
	},
	ifEmpty: function (object, key, defaultValue) {
		if (!(key in object)) {
			object[key] = defaultValue;
		}
		return object;
	}
});