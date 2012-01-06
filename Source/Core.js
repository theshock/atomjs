/*
---

name: "Core"

description: "The core of AtomJS."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

inspiration:
  - "[JQuery](http://jquery.com)"
  - "[MooTools](http://mootools.net)"

provides: atom

requires:
	- js185

...
*/

var innerExtend = function (proto) {
	return function (elem, from) {
		if (from == null) {
			from = elem;
			elem = atom;
		}

		var ext = proto ? elem[prototype] : elem,
		    accessors = atom.accessors && atom.accessors.inherit;

		for (var i in from) if (i != 'constructor') {
			if ( accessors && accessors(from, ext, i) ) continue;

			ext[i] = clone(from[i]);
		}
		return elem;
	};
};

var typeOf = function (item) {
	if (item == null) return 'null';

	var string = toString.call(item);
	for (var i in typeOf.types) if (i == string) return typeOf.types[i];

	if (item.nodeName){
		if (item.nodeType == 1) return 'element';
		if (item.nodeType == 3) return /\S/.test(item.nodeValue) ? 'textnode' : 'whitespace';
	}

	var type = typeof item;

	if (item && type == 'object') {
		if (atom.Class && item instanceof atom.Class) return 'class';
		if (atom.isEnumerable(item)) return 'arguments';
	}

	return type;
};
typeOf.types = {};
['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Class'].forEach(function(name) {
	typeOf.types['[object ' + name + ']'] = name.toLowerCase();
});


var clone = function (object) {
	var type = typeOf(object);
	return type in clone.types ? clone.types[type](object) : object;
};
clone.types = {
	array: function (array) {
		var i = array.length, c = new Array(i);
		while (i--) c[i] = clone(array[i]);
		return c;
	},
	object: function (object) {
		if (typeof object.clone == 'function') return object.clone();

		var c = {}, accessors = atom.accessors && atom.accessors.inherit;
		for (var key in object) {
			if (accessors && accessors(object, c, key)) continue;
			c[key] = clone(object[key]);
		}
		return c;
	}
};

atom.extend = innerExtend(false);

atom.extend({
	implement: innerExtend(true),
	toArray: function (elem) {
		return slice.call(elem);
	},
	/** @deprecated - use console-cap instead: https://github.com/theshock/console-cap/ */
	log: function () { throw new Error('deprecated') },
	isEnumerable: function(item){
		return item != null && toString.call(item) != '[object Function]' && typeof item.length == 'number';
	},
	append: function (target, source) {
		for (var i = 1, l = arguments.length; i < l; i++){
			source = arguments[i];
			if (source) for (var key in source) {
				target[key] = source[key];
			}
		}
		return target;
	},
	overloadSetter: function (fn) {
		return function (key, value) {
			if (typeof key != 'string') {
				for (var i in key) fn.call( this, i, key[i] );
			} else {
				fn.call( this, key, value );
			}
			return this;
		};
	},
	typeOf: typeOf,
	clone: clone
});
