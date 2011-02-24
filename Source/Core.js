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

new function () {
	var global = this.window || this.GLOBAL,
	    prototype = 'prototype',
	    apply = 'apply',
		toString = Object[prototype].toString;


	var Atom = function () {
		return atom.initialize[apply](this, arguments);
	};

	var atom = global.atom = function () {
		return new atomFactory(arguments);
	};

	var innerExtend = function (args, Default, proto) {
		var L = args.length;
		if (L === 3) {
			var
			elem = args[0],
			safe = args[1],
			from = args[2];
		} else if (L === 2) {
			elem = args[0];
			safe = false;
			from = args[1];
		} else if (L === 1) {
			elem = Default;
			safe = false;
			from = args[0];
		} else throw new TypeError();

		var ext = proto ? elem[prototype] : elem;
		for (var i in from) {
			if (safe && i in ext) continue;
			
			if ( !implementAccessors(from, ext, i) ) {
				ext[i] = i == 'prototype' ? from[i] : clone(from[i]);
			}
		}
		return elem;
	};

	var typeOf = function (item) {
		if (item == null) return 'null';

		if (item instanceof Atom) return 'atom';

		var string = toString.call(item);
		for (var i in typeOf.types) if (i == string) return typeOf.types[i];

		if (item.nodeName){
			if (item.nodeType == 1) return 'element';
			if (item.nodeType == 3) return typeOf.textnodeRE.test(item.nodeValue) ? 'textnode' : 'whitespace';
		} else if (item.callee && typeof item.length == 'number'){
			return 'arguments';
		}
		return typeof item;
	};
	typeOf.textnodeRE = /\S/;
	typeOf.types = {};
	['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp'].forEach(function(name) {
		typeOf.types['[object ' + name + ']'] = name.toLowerCase();
	});

	var implementAccessors = function (from, to, key) {
		if (arguments.length == 2) {
			// only for check if is accessor
			key = to;
			to  = null;
		}
		var g = from.__lookupGetter__(key), s = from.__lookupSetter__(key);

		if ( g || s ) {
			if (to != null) {
				if (g) to.__defineGetter__(key, g);
				if (s) to.__defineSetter__(key, s);
			}
			return true;
		}
		return false;
	};
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
			if ('clone' in object) {
				return typeof object.clone == 'function' ?
					object.clone() : object.clone;
			}
			var c = {};
			for (var key in object) if (!implementAccessors(object, c, key)) {
				c[key] = clone(object[key]);
			}
			return c;
		}
	};

	var mergeOne = function(source, key, current){
		switch (typeOf(current)){
			case 'object':
				if (typeOf(source[key]) == 'object') merge(source[key], current);
				else source[key] = clone(current);
			break;
			case 'array': source[key] = clone(current); break;
			default: source[key] = current;
		}
		return source;
	};
	var merge = function(source, k, v){
		if (typeOf(k) == 'string') return mergeOne(source, k, v);
		
		for (var i = 1, l = arguments.length; i < l; i++){
			var object = arguments[i];
			if (object) {
				for (var key in object) if (!implementAccessors(object, source, key)) {
					mergeOne(source, key, object[key]);
				}
			}
		}
		return source;
	};
	
	var extend = atom.extend = function (elem, safe, from) {
		return innerExtend(arguments, atom, false);
	};

	extend({
		initialize: function () {},
		implement: function (elem, safe, from) {
			return innerExtend(arguments, Atom, true);
		},
		toArray: function (elem) {
			return Array[prototype].slice.call(elem);
		},
		log: function () {
			var console = win.console;
			if (console && console.log) {
				return console.log[apply](console, arguments);
			} else return false;
		},
		isAtom: function (elem) {
			return elem && elem instanceof Atom;
		},
		implementAccessors: implementAccessors, // getter+setter
		typeOf: typeOf,
		clone: clone,
		merge: merge,
		plugins : {}
	});

	var atomFactory = atom.extend(function (args) {
		return Atom[apply](this, args);
	}, { prototype : Atom[prototype] });

	// JavaScript 1.8.5 Compatiblity
	atom.implement(Function, 'safe', {
		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
		bind : function(context /*, arg1, arg2... */) {
			'use strict';
			if (typeof this !== 'function') throw new TypeError();
			var proto  = Array[prototype],
				_slice = proto.slice,
				_concat = proto.concat,
				_arguments = _slice.call(arguments, 1),
				_this = this,
				_function = function() {
					return _this[apply](this instanceof _dummy ? this : context,
						_concat.call(_arguments, _slice.call(arguments, 0)));
				},
				_dummy = function() {};
			_dummy[prototype] = _this[prototype];
			_function[prototype] = new _dummy();
			return _function;
		}
	});

	extend(Object, 'safe', {
		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
		keys : function(o) {
			var result = [];
			for(var name in o) if (o.hasOwnProperty(name)) result.push(name);
			return result;
		}
	});

	extend(Array, 'safe', {
		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
		isArray : function(o) {
			return Object[prototype].toString.call(o) === '[object Array]';
		}
	});
};