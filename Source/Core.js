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
		if (atom.isArrayLike(item)) return 'arguments';
	}

	return type;
};
typeOf.types = {};
['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Class'].forEach(function(name) {
	typeOf.types['[object ' + name + ']'] = name.toLowerCase();
});

var isFunction = function (item) {
	return item && toString.call(item) == '[object Function]';
};


var clone = function (object) {
	var type = typeOf(object);
	return type in clone.types ? clone.types[type](object) : object;
};
clone.types = {
	'array': function (array) {
		var i = array.length, c = new Array(i);
		while (i--) c[i] = clone(array[i]);
		return c;
	},
	'class':function (object) {
		return typeof object.clone == 'function' ?
			object.clone() : object;
	},
	'object': function (object) {
		if (typeof object.clone == 'function') return object.clone();

		var c = {}, accessors = atom.accessors && atom.accessors.inherit;
		for (var key in object) {
			if (accessors && accessors(object, c, key)) continue;
			c[key] = clone(object[key]);
		}
		return c;
	}
};

var objectize = function (properties, value) {
	if (typeof properties != 'object') {
		var key = properties;
		properties = {};
		properties[key] = value;
	}
	return properties;
};

atom.extend = innerExtend(false);

atom.extend({
	implement: innerExtend(true),
	toArray: function (elem) {
		return slice.call(elem);
	},
	/** @deprecated - use console-cap instead: https://github.com/theshock/console-cap/ */
	log: function () { throw new Error('deprecated') },
	isArrayLike: function(item) {
		return item && (Array.isArray(item) || (
			typeof item != 'string' &&
			!isFunction(item) &&
			typeof item.length == 'number'
		));
	},
	append: function (target, source) {
		for (var i = 1, l = arguments.length; i < l; i++){
			source = arguments[i];
			if (source) for (var key in source) if (hasOwn.call(source, key)) {
				target[key] = source[key];
			}
		}
		return target;
	},
	/**
	 * Returns function that calls callbacks.get
	 * if first parameter is primitive & second parameter is undefined
	 *     object.attr('name')          - get
	 *     object.attr('name', 'value') - set
	 *     object.attr({name: 'value'}) - set
	 * @param {Object} callbacks
	 * @param {Function} callbacks.get
	 * @param {Function} callbacks.set
	 */
	slickAccessor: function (callbacks) {
		var setter =  atom.overloadSetter(callbacks.set);

		return function (properties, value) {
			if (typeof value === 'undefined' && typeof properties !== 'object') {
				return callbacks.get.call(this, properties);
			} else {
				return setter.call(this, properties, value);
			}
		};
	},
	overloadSetter: function (fn) {
		return function (properties, value) {
			properties = objectize(properties, value);
			for (var i in properties) fn.call( this, i, properties[i] );
			return this;
		};
	},
	ensureObjectSetter: function (fn) {
		return function (properties, value) {
			return fn.call(this, objectize(properties, value))
		}
	},
	typeOf: typeOf,
	clone: clone
});