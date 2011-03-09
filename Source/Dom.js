/*
---

name: "Dom"

description: "todo"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom

inspiration:
  - "[JQuery](http://jquery.org)"

provides: dom

...
*/
new function () {
	var win = window,
	    doc = win.document,
		tagNameRE = /^[-_a-z0-9]+$/i,
		classNameRE = /^\.[-_a-z0-9]+$/i,
		idRE = /^#[-_a-z0-9]+$/i,
		toArray = atom.toArray,
		isArray = Array.isArray,
		length = 'length',
		getElement = 'getElement',
		getElementById = getElement + 'ById',
		getElementsByClassName = getElement + 'sByClassName',
		getElementsByTagName = getElement + 'sByTagName',
		querySelectorAll = 'querySelectorAll',
		appendChild = 'appendChild',
		setter = function (args) {
			if (args.length == 1) {
				return args[0];
			} else {
				var r = {};
				r[args[0]] = args[1];
				return r;
			}
		},
		prevent = function (e) {
			e.preventDefault();
			return false;
		};

	atom.extend({
		initialize : function (sel, context) {
			if (!arguments[length]) {
				this.elems = [doc];
				return this;
			}

			context = context || doc;
			if (arguments.length == 2) return atom(context).find(sel);

			if (typeof sel == 'function' && !atom.isAtom(sel)) {
				this.elems = [context];
				return this.ready(sel);
			}
			this.elems = (sel instanceof HTMLCollection) ? toArray(sel)
				: (typeof sel == 'string') ? atom.findByString(context, sel)
				: (atom.isAtom(sel))       ? sel.elems
				: (isArray(sel))     ? sel
				:      atom.find(context, sel);
			return this;
		},
		findByString : function (context, sel) {
			var find = atom.find;
			return sel.match(idRE)     ? find(context, { id: sel.substr(1) }) :
				sel.match(classNameRE) ? find(context, { Class: sel.substr(1) }) :
				sel.match(tagNameRE)   ? find(context, { tag: sel }) :
					toArray(context[querySelectorAll](sel));
		},
		find : function (context, sel) {
			if (!sel) return context == null ? [] : [context];

			var result = atom.isDomElement(sel) ? [sel]
				:  typeof sel == 'string' ? atom.findByString(context, sel)
				: (sel.id   ) ?        [context[getElementById](sel.id) ]
				: (sel.tag  ) ? toArray(context[getElementsByTagName](sel.tag))
				: (sel.Class) ? toArray(context[getElementsByClassName](sel.Class))
				:                      [context];
			return (result.length == 1 && result[0] == null) ? [] : result;
		},
		isDomElement: function (elem) {
			return elem && elem.nodeName;
		}
	}).implement({
		get : function (index) {
			return this.elems[index * 1 || 0];
		},
		get length() {
			return this.elems.length;
		},
		get body() {
			return this.find('body');
		},
		get first() {
			return this.elems[0];
		},
		html : function (value) {
			if (arguments.length) {
				this.first.innerHTML = value;
				return this;
			} else {
				return this.first.innerHTML;
			}
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
			attr = setter(arguments);
			if (typeof attr[0] == 'string') {
				return this.first.getAttribute(attr[0]);
			}
			return this.each(function (elem) {
				for (var i in attr) elem.setAttribute(i, attr[i]);
			});
		},
		css : function (css) {
			css = setter(arguments);
			if (typeof css[0] == 'string') {
				return this.first.style[css[0]];
			}
			return this.each(function (elem) {
				atom.extend(elem.style, css);
			});
		},
		bind : function () {
			var events = setter(arguments), bind = this;
			return this.each(function (elem) {
				for (var i in events) {
					if (elem == doc && i == 'load') elem = win;
					var fn = events[i] === false ? prevent : events[i].bind(bind);
					elem.addEventListener(i, fn, false);
				}
			});
		},
		// todo: unbind
		delegate : function (tagName, event, fn) {
			return this.bind(event, function (e) {
				if (e.target.tagName.toLowerCase() == tagName.toLowerCase()) {
					fn.apply(this, arguments);
				}
			});
		},
		wrap : function (wrapper) {
			wrapper = atom(wrapper).first;
			var obj = this.first;
			obj.parentNode.replaceChild(wrapper, obj);
			wrapper[appendChild](obj);
			return this;
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
				}
			});
			return atom(result);
		},
		appendTo : function (to) {
			var fr = doc.createDocumentFragment();
			this.each(function (elem) {
				fr[appendChild](elem);
			});
			atom(to).first[appendChild](fr);
			return this;
		},
		addClass: function (classNames) {
			if (!classNames) return this;
			
			if (!isArray(classNames)) classNames = [classNames];
			
			return this.each(function (elem) {
				var property = elem.className, current = ' ' + property + ' ';
				
				for (var i = classNames.length; i--;) {
					var c = ' ' + classNames[i];
					if (current.indexOf(c + ' ') < 0) property += c;
				}
				
				elem.className = property.trim();
			});
		},
		removeClass: function (classNames) {
			if (!isArray(classNames) && classNames) classNames = [classNames];
			
			return this.each(function (elem) {
				var current = ' ' + elem.className + ' ';
				for (var i = classNames.length; i--;) {
					current = current.replace(' ' + classNames[i] + ' ', ' ');
				}
				elem.className = current.trim();
			});
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
};