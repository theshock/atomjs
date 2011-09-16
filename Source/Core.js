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

...
*/

(function (Object, Array) {
	var prototype = 'prototype',
	    apply     = 'apply',
		toString  = Object[prototype].toString,
		slice     = [].slice;

	var atom = this.atom = function () {
		if (atom.initialize) return atom.initialize[apply](this, arguments);
	};

	atom.global = this;

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
		/**
		 * @deprecated - use console-cap instead:
		 * @see https://github.com/theshock/console-cap/
		 */
		log: function () {
			// ie9 bug, typeof console.log == 'object'
			if (atom.global.console) Function.prototype.apply.call(console.log, console, arguments);
		},
		isEnumerable: function(item){
			return item != null && toString.call(item) != '[object Function]' && typeof item.length == 'number';
		},
		append: function (target, source) {
			for (var i = 1, l = arguments.length; i < l; i++){
				source = arguments[i] || {};
				for (var key in source) {
					target[key] = source[key];
				}
			}
			return target;
		},
		typeOf: typeOf,
		clone: clone
	});

	// JavaScript 1.8.5 Compatiblity
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind

	if (!Function.prototype.bind) {
		Function.prototype.bind = function(context /*, arg1, arg2... */) {
			if (typeof this !== "function") throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");

			var args   = slice.call(arguments, 1),
				toBind = this,
				Nop    = function () {},
				Bound  = function () {
					var isInstance;
					// Opera & Safari bug fixed. I must fix it in right way
					// TypeError: Second argument to 'instanceof' does not implement [[HasInstance]]
					try {
						isInstance = this instanceof Nop;
					} catch (ignored) {
						// console.log( 'bind error', Nop.prototype );
						isInstance = false;
					}
					return toBind.apply(
						isInstance ? this : ( context || {} ),
						args.concat( slice.call(arguments) )
					);
				};
			Nop.prototype   = toBind.prototype;
			Bound.prototype = new Nop();
			return Bound;
		};
	}

	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
	if (!Object.keys) {
		Object.keys = function(obj) {
			if (obj !== Object(obj)) throw new TypeError('Object.keys called on non-object');

			var keys = [], i, has = Object[prototype].hasOwnProperty;
			for (i in obj) if (has.call(obj, i)) keys.push(i);
			return keys;
		};
	}

	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
	if (!Array.isArray) {
		Array.isArray = function(o) {
			return o && toString.call(o) === '[object Array]';
		};
	}

	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create
	if (!Object.create) {
		Object.create = function (o) {
			if (arguments.length > 1) {
				throw new Error('Object.create implementation only accepts the first parameter.');
			}
			function F() {}
			F.prototype = o;
			return new F();
		};
	}
}).call(typeof exports == 'undefined' ? window : exports, Object, Array);