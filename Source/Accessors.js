/*
---

name: "Accessors"

description: "Implementing accessors"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

copyright: "Copyright (c) 2010-2011 [Ponomarenko Pavel](shocksilien@gmail.com)."

authors: "The AtomJS production team"

requires:
	- atom

provides: accessors

...
*/

(function (Object) {
	var getAccessors = Object.getOwnPropertyDescriptor ?
		function (from, key, bool) {
			var descriptor = Object.getOwnPropertyDescriptor(from, key);
			if (descriptor && (descriptor.set || descriptor.get) ) {
				if (bool) return true;

				return {
					set: descriptor.set,
					get: descriptor.get
				};
			}
			return bool ? false : null;
		} : function (from, key, bool) {
			var g = from.__lookupGetter__(key), s = from.__lookupSetter__(key);

			if ( g || s ) {
				if (bool) return true;
				return {
					get: g,
					set: s
				};
			}
			return bool ? false : null;
		}; /* getAccessors */

	var setAccessors = function (object, prop, descriptor) {
		if (descriptor) {
			if (Object.defineProperty) {
					for (var i in descriptor) if (['set', 'get'].indexOf(i) == -1) throw new TypeError('Unknown property: ' + i);
					Object.defineProperty(object, prop, descriptor);
			} else {
				if (descriptor.get) object.__defineGetter__(prop, descriptor.get);
				if (descriptor.set) object.__defineSetter__(prop, descriptor.set);
			}
		}
		return object;
	};
	
	var hasAccessors = function (object, key) {
		return getAccessors(object, key, true);
	};

	var inheritAccessors = function (from, to, key) {
		if (key == null) return hasAccessors(from, /* key */ to);

		var a = getAccessors(from, key);

		if ( a ) {
			setAccessors(to, key, a);
			return true;
		}
		return false;
	};


	atom.extend({
		accessors: {
			get: getAccessors,
			set: setAccessors,
			has: hasAccessors,
			inherit: inheritAccessors
		}
	});
})(Object);