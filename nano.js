(function () {

	var win, doc, // Better compression
		s_object = 'object', s_string = 'string', s_safe = 'safe',
		TRUE = true, FALSE = false;


	var nano = function (arg, context) {
		if (context && nano.isNano(context)) {
			return context.find(arg);
		} else {
			return new Nano(arg, context || doc);
		}
	};
	var extend = nano.extend = function (elem, safe, from) {
		if (arguments.length == 2) {
			from = safe;
			safe = FALSE;
		} else if (arguments.length == 1) {
			from = elem;
			elem = nano;
		}
		for (var i in from) {
			if (safe && i in elem) continue;
			elem[i] = from[i];
		}
		return elem;
	};
	extend(nano, {
		setContext : function (newWindow) {
			win = newWindow;
			doc = win.document;
			win.nano = nano;
			return this;
		},
		getContext : function () {
			return win;
		},
		implement : function (elem, safe, from) {
			if (arguments.length == 2) {
				from = safe;
				safe = FALSE;
			} else if (arguments.length == 1) {
				from = elem;
				elem = Nano;
			}
			nano.extend(elem.prototype, safe, from);
			return elem;
		},
		deepEquals : function (first, second) {
			for (var i in first) {
				var f = first[i], s = second[i];
				if (typeof f == s_object) {
					if (!s || !nano.deepEquals(f, s)) return FALSE;
				} else if (f != s) {
					return FALSE;
				}
			}

			for (var k in second) if (!(k in first)) return FALSE;

			return TRUE;
		},
		find : function (In, selector) {
			if (!selector) return [In];

			if (typeof selector == s_string) {
				return toArray(In.querySelectorAll(selector));
			} else if (selector.nodeName) {
				return [selector];
			} else if (selector.id) {
				return [In.getElementById(selector.id)];
			} else if (selector.tag) {
				return toArray(In.getElementsByTagName(selector.tag));
			} else if (selector.Class) {
				return toArray(In.getElementsByClassName(selector.Class));
			} else {
				return [In];
			}
		},
		toArray : function (elem) {
			return Array.prototype.slice.call(elem);
		},
		unique: function (array) {
			var tmp = [];
			for (var i = 0; i < array.length; i++) if (i in array) {
				if (!nano.contains(tmp, array[i])) {
					tmp.push(array[i]);
				}
			}
			return tmp;
		},
		setter : function (args) {
			if (args.length == 1 && typeof args[0] == s_object) {
				return args[0];
			} else if (args.length == 1) {
				return args[0];
			} else {
				var r = {};
				r[args[0]] = args[1];
				return r;
			}
		},
		contains : function (array, elem) {
			for (var i = array.length; i--;) if (i in array) {
				 if (elem === array[i]) return TRUE;
			}
			return FALSE;
		},
		log : function () {
			var c = win.console;
			if (c && c.log) {
				return c.log.apply(c, arguments);
			} else return FALSE;
		},
		isNano : function (elem) {
			return elem && elem instanceof Nano;
		},
		rich : function () {
			nano.implement(Number, s_safe, {
				between: function (n1, n2, equals) {
					return (n1 <= n2) && (
						(equals == 'L'   && this == n1) ||
						(equals == 'R'   && this == n2) ||
						(  this  > n1    && this  < n2) ||
						([TRUE, 'LR', 'RL'].contains(equals) && (n1 == this || n2 == this))
					);
				},
				equals : function (to, accuracy) {
					if (arguments.length == 1) accuracy = 8;
					return this.toFixed(accuracy) == to.toFixed(accuracy);
				}
			});

			nano.implement(Array, s_safe, {
				contains : function (elem) {
					return nano.contains(this, elem);
				}
			});
		}
	});

	var toArray = nano.toArray;

	var tagNameRE = /^[a-z]+$/;
	var classNameRE = /^\.[a-z]+$/;
	var idRe = /^\#[a-z]+$/;

	var Nano = function (arg, In) {
		if (!arguments.length) {
			var e = [doc];
		} else if (typeof arg == s_string) {
			e = arg.match(idRe) ? [In.getElementById(arg)] :
				toArray(
					arg.match(classNameRE) ? In.getElementsByClassName(arg) :
					arg.match(tagNameRE)   ? In.getElementsByTagName(arg) :
						In.querySelectorAll(arg)
				);
		} else if (nano.isNano(arg)) {
			e = arg.elems;
		} else if (typeof arg == 'function') {
			this.elems = e = [In];
			this.ready(arg);
		} else if (Array.isArray(arg)) {
			e = arg;
		} else if (arg instanceof HTMLCollection) {
			e = nano.toArray(arg);
		} else {
			e = nano.find(In, arg);
		}
		this.elems = e;
	};

	nano.implement(Nano, {
		get : function (index) {
			return this.elems[index * 1 || 0];
		},
		create : function (tagName, index, attr) {
			if (typeof index == s_object) {
				attr  = index;
				index = 0;
			}
			var elem = nano(this.get(index).createElement(tagName));
			if (attr) elem.attr(attr);
			return elem;
		},
		each : function (fn) {
			this.elems.forEach(fn.bind(this));
			return this;
		},
		attr : function (attr) {
			attr = nano.setter(arguments);
			if (typeof attr[0] == s_string) {
				return this.get().getAttribute(attr[0]);
			}
			return this.each(function (elem) {
				nano.extend(elem, attr);
			});
		},
		css : function (css) {
			css = nano.setter(arguments);
			if (typeof css[0] == s_string) {
				return this.get().style[css[0]];
			}
			return this.each(function (elem) {
				nano.extend(elem.style, css);
			});
		},
		bind : function () {
			var events = nano.setter(arguments);
			return this.each(function (elem) {
				for (var i in events) {
					if (elem == doc && i == 'load') elem = win;
					elem.addEventListener(i, events[i].bind(this), FALSE);
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
			if (arguments.length == 1) {
				fn   = full;
				full = FALSE;
			}
			return this.bind(full ? 'load' : 'DOMContentLoaded', fn);
		},
		find : function (selector) {
			var result = [];
			this.each(function (elem) {
				result = result.concat(nano.find(elem, selector));
			});
			return nano(nano.unique(result));
		},
		log : function () {
			nano.log.apply(nano, arguments.length ? arguments : ['nano', this.elems]);
			return this;
		},
		appendTo : function (to) {
			to = nano(to).get();
			return this.each(function (elem) {
				to.appendChild(elem);
			});
		},
		destroy : function () {
			return this.each(function (elem) {
				elem.parentNode.removeChild(elem);
			});
		}
	});

	nano.setContext(window);

	// JavaScript 1.8.5 Compatiblity
	nano.implement(Function, s_safe, {
		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
		bind : function(context /*, arg1, arg2... */) {
			'use strict';
			if (typeof this !== 'function') throw new TypeError();
			var proto  = Array.prototype,
				_slice = proto.slice,
				_concat = proto.concat,
				_arguments = _slice.call(arguments, 1),
				_this = this,
				_function = function() {
					return _this.apply(this instanceof _dummy ? this : context,
						_concat.call(_arguments, _slice.call(arguments, 0)));
				},
				_dummy = function() {};
			_dummy.prototype = _this.prototype;
			_function.prototype = new _dummy();
			return _function;
		}
	});

	extend(Object, s_safe, {
		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
		keys : function(o) {
			var result = [];
			for(var name in o) if (o.hasOwnProperty(name)) result.push(name);
			return result;
		}
	});

	extend(Array, s_safe, {
		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
		isArray : function(o) {
			return Object.prototype.toString.call(o) === '[object Array]';
		}
	});
})();