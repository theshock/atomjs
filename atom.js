(function () {
	var win = window,
	    doc = win.document,
	    prototype = 'prototype',
	    apply = 'apply';

	var atom = window.atom = function () {
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
			var g = from.__lookupGetter__(i), s = from.__lookupSetter__(i);

			if ( g || s ) {
				if ( g ) ext.__defineGetter__(i, g);
				if ( s ) ext.__defineSetter__(i, s);
			 } else ext[i] = from[i];
		}
		return elem;
	};

	var extend = atom.extend = function (elem, safe, from) {
		return innerExtend(arguments, atom, false);
	};
	extend({
		initialize : function () {},
		implement : function (elem, safe, from) {
			return innerExtend(arguments, Atom, true);
		},
		toArray : function (elem) {
			return Array[prototype].slice.call(elem);
		},
		setter : function (args) {
			if (args.length == 1) {
				return args[0];
			} else {
				var r = {};
				r[args[0]] = args[1];
				return r;
			}
		},
		log : function () {
			var console = win.console;
			if (console && console.log) {
				return console.log[apply](console, arguments);
			} else return false;
		},
		isAtom : function (elem) {
			return elem && elem instanceof Atom;
		}
	});

	var Atom = function () {
		return atom.initialize[apply](this, arguments);
	};

	var atomFactory = atom.extend(function (args) {
		return Atom[apply](this, args);
	}, {prototype : Atom[prototype] });

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
})();

/**
 * Atom.Plugins.DOM
 */
(function () {
	var win = window,
	    doc = win.document,
		atom = win.atom,
		tagNameRE = /^[-_a-z0-9]+$/i,
		classNameRE = /^\.[-_a-z0-9]+$/i,
		idRe = /^\#[-_a-z0-9]+$/i,
		toArray = atom.toArray,
		length = 'length',
		getElement = 'getElement',
		getElementById = getElement + 'ById',
		getElementsByClassName = getElement + 'sByClassName',
		getElementsByTagName = getElement + 'sByTagName',
		querySelectorAll = 'querySelectorAll',
		appendChild = 'appendChild';


	atom.extend({
		initialize : function (arg, context) {
			if (context && atom.isAtom(context)) return context.find(arg);
			context = context || doc;

			if (!arguments[length]) {
				var e = [doc];
			} else if (typeof arg == 'string') {
				e = arg.match(idRe) ? [context[getElementById](arg.substr(1))] :
					toArray(
						arg.match(classNameRE) ? context[getElementsByClassName](arg.substr(1)) :
						arg.match(tagNameRE)   ? context[getElementsByTagName](arg) :
							context[querySelectorAll](arg)
					);
			} else if (atom.isAtom(arg)) {
				e = arg.elems;
			} else if (typeof arg == 'function') {
				this.elems = e = [context];
				this.ready(arg);
			} else if (Array.isArray(arg)) {
				e = arg;
			} else if (arg instanceof HTMLCollection) {
				e = toArray(arg);
			} else {
				e = atom.find(context, arg);
			}
			this.elems = e;
			return this;
		},
		find : function (context, selector) {
			if (!selector) return [context];

			if (typeof selector == 'string') {
				return toArray(context[querySelectorAll](selector));
			} else if (selector.nodeName) {
				return [selector];
			} else if (selector.id) {
				return [context[getElementById](selector.id)];
			} else if (selector.tag) {
				return toArray(context[getElementsByTagName](selector.tag));
			} else if (selector.Class) {
				return toArray(context[getElementsByClassName](selector.Class));
			} else {
				return [context];
			}
		}
	}).implement({
		get : function (index) {
			return this.elems[index * 1 || 0];
		},
		get body () {
			return this.find('body');
		},
		create : function (tagName, index, attr) {
			if (typeof index == 'object') {
				attr  = index;
				index = 0;
			}
			var elem = atom(this.get(index).createElement(tagName));
			if (attr) elem.attr(attr);
			return elem;
		},
		each : function (fn) {
			this.elems.forEach(fn.bind(this));
			return this;
		},
		attr : function (attr) {
			attr = atom.setter(arguments);
			if (typeof attr[0] == 'string') {
				return this.get().getAttribute(attr[0]);
			}
			return this.each(function (elem) {
				atom.extend(elem, attr);
			});
		},
		css : function (css) {
			css = atom.setter(arguments);
			if (typeof css[0] == 'string') {
				return this.get().style[css[0]];
			}
			return this.each(function (elem) {
				atom.extend(elem.style, css);
			});
		},
		bind : function () {
			var events = atom.setter(arguments);
			return this.each(function (elem) {
				for (var i in events) {
					if (elem == doc && i == 'load') elem = win;
					elem.addEventListener(i, events[i].bind(this), false);
				}
			}.bind(this));
		},
		delegate : function (tagName, event, fn) {
			return this.bind(event, function (e) {
				if (e.target.tagName.toLowerCase() == tagName.toLowerCase()) {
					fn.apply(this, arguments);
				}
			});
		},
		ready : function (full, fn) {
			if (arguments[length] == 1) {
				fn   = full;
				full = false;
			}
			return this.bind(full ? 'load' : 'DOMContentLoaded', fn.bind(this, atom));
		},
		find : function (selector) {
			var result = [];
			this.each(function (elem) {
				var found = atom.find(elem, selector);
				for (var i = 0, l = found[length]; i < l; i++) {
					if (result.indexOf(found[i]) === -1) result.push(found[i]);
				};
			});
			return atom(result);
		},
		appendTo : function (to) {
			var fr = doc.createDocumentFragment();
			this.each(function (elem) {
				fr[appendChild](elem);
			});
			atom(to).get()[appendChild](fr);
			return this;
		},
		log : function () {
			atom.log.apply(atom, arguments[length] ? arguments : ['atom', this.elems]);
			return this;
		},
		destroy : function () {
			return this.each(function (elem) {
				elem.parentNode.removeChild(elem);
			});
		}
	});
})();


/**
 * Atom.Plugins.Types.String
 */
atom.implement(Number, 'safe', {
	between: function (n1, n2, equals) {
		return (n1 <= n2) && (
			(equals == 'L'   && this == n1) ||
			(equals == 'R'   && this == n2) ||
			(  this  > n1    && this  < n2) ||
			([true,'LR','RL'].indexOf(equals) != -1 && (n1 == this || n2 == this))
		);
	},
	equals : function (to, accuracy) {
		if (arguments.length == 1) accuracy = 8;
		return this.toFixed(accuracy) == to.toFixed(accuracy);
	}
});

/**
 * Atom.Plugins.Types.Array
 */
atom.implement(Array, 'safe', {
	contains : function (elem) {
		return this.indexOf(elem) != -1;
	}
});

/**
 * Atom.Plugins.Types.Object
 */
atom.extend(Object, 'safe', {
	deepEquals : function (first, second) {
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
	}
});

/**
 * Atom.Plugins.Class
 */

(function () {
	var impl = atom.implement, extend = atom.extend,
	    prototype = 'prototype', constructor = 'constructor',
	    makeFn = function(){ return function(){} };

	var Factory = impl(function ( Parent, object) {
		if (typeof Parent !== 'function') {
			object = Parent;
			Parent = null;
		}
		
		var $class = this.$class = function () {
			proto.hasOwnProperty(constructor) &&
				proto[constructor].apply(this, arguments);
		};

		if (Parent) {
			var tmp = makeFn();
			tmp[prototype]   = Parent[prototype];
			$class[prototype] = new tmp();
		}
		var proto = $class[prototype];
		
		object && impl($class, object);
		impl($class, { self : $class });

		$class.factory = this;

		this.extend(Parent);
		if (object) for (var i in object) {
			if (object.hasOwnProperty(i) && typeof object[i] === 'function') {
				proto[i] = function (key, method, parent) {
					var wrapper = extend(function () {
						var current = this.$caller;
						this.$caller = wrapper;
						var result = method.apply(this, arguments);
						this.$caller = current;
						return result;
					}, { parent : parent && parent[prototype][key], name : key });
					return wrapper;
				}(i, object[i], Parent);
			}
		}
		
		var parent = proto.parent = function (args) {
			if (!this.$caller) throw new Error('The method "parent" cannot be called.');

			var name   = this.$caller.name,
				parent = this.$caller.parent;
			if (!parent) throw new Error('The method "' + name + '" has no parent.');

			return parent.apply(this, arguments);
		};
		
		this.$factory = extend(function (args) {
			return $class.apply(this, args);
		}, { prototype : proto });
	}, {
		extend : function (object) {
			for (var i in object) if (i !== 'prototype') {
				this.$class[i] = object[i];
			}
			return this;
		},
		mixin : function () {
			var a = arguments, i = 0, l = a.length;
			while(i < l) this.implement(a[i++][prototype]);
			return this;
		},
		produce : function (args) {
			return this.$factory(args);
		},
		get : function () {
			return this.$class;
		}
	});



	extend({
		Class : function (parent, object) {
			return new Factory(parent, object).get();
		},
		Factory : function (parent, object) {
			return new Factory(parent, object);
		}
	});
})();