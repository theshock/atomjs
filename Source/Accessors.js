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
	var standard = !!Object.getOwnPropertyDescriptor, nonStandard = !!{}.__defineGetter__;

	if (!standard && !nonStandard) throw new Error('Accessors are not supported');

	var lookup = nonStandard ?
		function (from, key, bool) {
			var g = from.__lookupGetter__(key), s = from.__lookupSetter__(key);

			if ( g || s ) {
				if (bool) return true;
				return {
					get: g,
					set: s
				};
			}
			return bool ? false : null;
		} :
		function (from, key, bool) {
			var descriptor = Object.getOwnPropertyDescriptor(from, key);
			if (!descriptor) {
				// try to find accessors according to chain of prototypes
				var proto = Object.getPrototypeOf(from);
				if (proto) return accessors.lookup(proto, key, bool);
			} else if ( descriptor.set || descriptor.get ) {
				if (bool) return true;

				return {
					set: descriptor.set,
					get: descriptor.get
				};
			}
			return bool ? false : null;
		}; /* lookup */

	var define = function (object, prop, descriptor) {
		if (descriptor) {
			if (nonStandard) {
				if (descriptor.get) object.__defineGetter__(prop, descriptor.get);
				if (descriptor.set) object.__defineSetter__(prop, descriptor.set);
			} else {
				var desc = {
					get: descriptor.get,
					set: descriptor.set,
					configurable: true,
					enumerable: true
				};
				Object.defineProperty(object, prop, desc);
			}
		}
		return object;
	};

	var accessors = {
		lookup: lookup,
		define: define,
		has: function (object, key) {
			return accessors.lookup(object, key, true);
		},
		inherit: function (from, to, key) {
			var a = accessors.lookup(from, key);

			if ( a ) {
				accessors.define(to, key, a);
				return true;
			}
			return false;
		}
	};

	atom.extend({ accessors: accessors });
})(Object);