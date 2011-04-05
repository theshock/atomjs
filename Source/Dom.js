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
	var undefined,
		win = window,
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
		addEventListener = 'addEventListener',
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
		},
		ignoreCssPostfix = {
			zIndex: true,
			fontWeight: true,
			opacity: true,
			zoom: true,
			lineHeight: true
		},
		domReady = false,
		onDomReady = [];
	
	new function () {
		var ready = function () {
			if (domReady) return;
			
			domReady = true;
			
			for (var i = 0, l = onDomReady[length]; i < l; onDomReady[i++]());
			
			onDomReady = [];
		};
		
		doc[addEventListener]('DOMContentLoaded', ready, false);
		win[addEventListener]('load', ready, false);
	};

	var dom = function (sel, context) {
		if (! (this instanceof dom)) {
			return new dom(sel, context);
		}

		if (!arguments[length]) {
			this.elems = [doc];
			return this;
		}

		if (context !== undefined) {
			return new dom(context || doc).find(sel);
		}
		context = context || doc;

		if (typeof sel == 'function' && !(sel instanceof dom)) {
			// onDomReady
			var fn = sel.bind(this, atom, dom);
			domReady ? setTimeout(fn, 1) : onDomReady.push(fn);
			return this;
		}

		var elems = this.elems =
			  sel instanceof HTMLCollection ? toArray(sel)
			: typeof sel == 'string' ? dom.query(context, sel)
			: sel instanceof dom     ? sel.elems
			: isArray(sel)           ? sel
			:                          dom.find(context, sel);

		if (elems.length == 1 && elems[0] == null) {
			elems.length = 0;
		}

		return this;
	};
	atom.extend(dom, {
		query : function (context, sel) {
			return sel.match(idRE)        ?        [context[getElementById        ](sel.substr(1))] :
			       sel.match(classNameRE) ? toArray(context[getElementsByClassName](sel.substr(1))) :
			       sel.match(tagNameRE)   ? toArray(context[getElementsByTagName  ](sel)) :
			                                toArray(context[querySelectorAll      ](sel));
		},
		find: function (context, sel) {
			if (!sel) return context == null ? [] : [context];

			var result = sel.nodeName ? [sel]
				: typeof sel == 'string' ? dom.query(context, sel) : [context];
			return (result.length == 1 && result[0] == null) ? [] : result;
		},
		isElement: function (node) {
			return !!(node && node.nodeName);
		}
	});
	atom.implement(dom, {
		get length() {
			return this.elems ? this.elems.length : 0;
		},
		get body() {
			return this.find('body');
		},
		get first() {
			return this.elems[0];
		},
		get : function (index) {
			return this.elems[index * 1 || 0];
		},
		filter: function (sel) {
			if (sel.match(tagNameRE)) var tag = sel;
			if (sel.match(idRE     )) var id  = sel.substr(1);
			return new dom(this.elems.filter(function (elem) {
				return tag ? elem.tagName == tag :
				       id  ? elem.id      == id :
				  elem.parentNode && toArray(
				    elem.parentNode.querySelectorAll(sel)
				  ).indexOf(elem) >= 0;
			}));
		},
		is: function (selector) {
			return this.filter(selector).length > 0;
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
			var elem = dom(this.get(index).createElement(tagName));
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
				for (var i in css) {
					var value = css[i];
					if (typeof value == 'number' && !ignoreCssPostfix[i]) {
						value += 'px';
					}
					elem.style[i] = value;
				}
			});
		},
		bind : function () {
			var events = setter(arguments), bind = this;
			return this.each(function (elem) {
				for (var i in events) {
					if (elem == doc && i == 'load') elem = win;
					var fn = events[i] === false ? prevent : events[i].bind(bind);
					elem[addEventListener](i, fn, false);
				}
			});
		},
		unbind: function () {
			var events = setter(arguments), bind = this;
			return this.each(function (elem) {
				for (var i in events) {
					if (elem == doc && i == 'load') elem = win;
					var fn = events[i] === false ? prevent : events[i].bind(bind);
					elem[addEventListener](i, fn, false);
				}
			});
		},
		// todo: unbind
		delegate : function (selector, event, fn) {
			return this.bind(event, function (e) {
				if (new dom(e).is(selector)) {
					fn.apply(this, arguments);
				}
			});
		},
		wrap : function (wrapper) {
			wrapper = dom(wrapper).first;
			return this.replaceWith(wrapper).appendTo(wrapper);
		},
		replaceWith: function (element) {
			element = dom(element).first;
			var obj = this.first;
			obj.parentNode.replaceChild(element, obj);
			return this;
		},
		find : function (selector) {
			var result = [];
			this.each(function (elem) {
				var found = dom.find(elem, selector);
				for (var i = 0, l = found[length]; i < l; i++) {
					if (result.indexOf(found[i]) === -1) result.push(found[i]);
				}
			});
			return new dom(result);
		},
		appendTo : function (to) {
			var fr = doc.createDocumentFragment();
			this.each(function (elem) {
				fr[appendChild](elem);
			});
			dom(to).first[appendChild](fr);
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
			atom.log.apply(atom, arguments[length] ? arguments : ['atom.dom', this.elems]);
			return this;
		},
		destroy : function () {
			return this.each(function (elem) {
				elem.parentNode.removeChild(elem);
			});
		},
		constructor: dom
	});

	atom.extend({ dom: dom });
};