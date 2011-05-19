/*
---

name: "Core"

description: "The core of AtomJS."

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

copyright: "Copyright (c) 2010-2011 [Ponomarenko Pavel](shocksilien@gmail.com)."

authors: "The AtomJS production team"

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
		slice     = [].slice,
		FuncProto = Function[prototype];

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
		} else if (item && item.callee && typeof item.length == 'number'){
			return 'arguments';
		}
		
		var type = typeof item;
		
		return (type == 'object' && atom.Class && item instanceof atom.Class) ? 'class' : type;
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
		log: function () {
			// ie9 bug, typeof console.log == 'object'
			if (global.console) FuncProto[apply].call(console.log, console, arguments);
		},
		typeOf: typeOf,
		clone: clone
	});

	// JavaScript 1.8.5 Compatiblity

	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
	if (!FuncProto.bind) {
		FuncProto.bind = function(context /*, arg1, arg2... */) {
			var args  = slice.call(arguments, 1),
				self  = this,
				nop   = function () {},
				bound = function () {
					return self[apply](
						this instanceof nop ? this : ( context || {} ),
						args.concat( slice.call(arguments) )
					);
				};
			nop[prototype]   = self[prototype];
			bound[prototype] = new nop();
			return bound;
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
})(Object, Array);