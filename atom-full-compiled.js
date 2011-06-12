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
			if (atom.global.console) FuncProto[apply].call(console.log, console, arguments);
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
			var g = from.__lookupGetter__(key), s = from.__lookupSetter__(key), has = !!(g || s);

			if (bool) return has;

			return has ? { get: g, set: s } : null;
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

	var define = nonStandard ?
		function (object, prop, descriptor) {
			if (descriptor) {
				if (descriptor.get) object.__defineGetter__(prop, descriptor.get);
				if (descriptor.set) object.__defineSetter__(prop, descriptor.set);
			}
			return object;
		} :
		function (object, prop, descriptor) {
			if (descriptor) {
				var desc = {
					get: descriptor.get,
					set: descriptor.set,
					configurable: true,
					enumerable: true
				};
				Object.defineProperty(object, prop, desc);
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

/*
---

name: "Dom"

description: "todo"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom
	- accessors

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
		onDomReady = [],
		camelCase = function (str) {
			return str.replace(/-\D/g, function(match){
				return match[1].toUpperCase();
			});
		};
	
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

		if (!context && sel === 'body') {
			this.elems = [doc.body];
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
			: sel instanceof dom     ? toArray(sel.elems)
			: isArray(sel)           ? toArray(sel)
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
		create: function (tagName, attr) {
			var elem = new dom(document.createElement(tagName));
			return attr ? elem.attr(attr) : elem;
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
		parent : function(step) {
			if(step === undefined)
				var step = 1;
			var stepCount = function(elem, step) {
				if(step > 0) {
					step--;
					return stepCount(atom.dom(elem.first.parentNode), step);
				}
				return elem;
			};
			return stepCount(this, step);
		},
		filter: function (sel) {
			if (sel.match(tagNameRE)) var tag = sel.toUpperCase();
			if (sel.match(idRE     )) var id  = sel.substr(1).toUpperCase();
			return new dom(this.elems.filter(function (elem) {
				return tag ? elem.tagName.toUpperCase() == tag :
				       id  ? elem.id     .toUpperCase() == id :
				  elem.parentNode && toArray(
				    elem.parentNode.querySelectorAll(sel)
				  ).indexOf(elem) >= 0;
			}));
		},
		is: function (selector) {
			return this.filter(selector).length > 0;
		},
		html : function (value) {
			if (value !== undefined) {
				this.first.innerHTML = value;
				return this;
			} else {
				return this.first.innerHTML;
			}
		},
		text : function (value) {
			if(document.getElementsByTagName("body")[0].innerText != undefined) {
				if(value === undefined)
					return this.first.innerText;
				this.first.innerText = value;
			}
			else {
				if(value === undefined)
					return this.first.textContent;
				this.first.textContent = value;
			}
			return this;
		},
		create : function (tagName, index, attr) {
			if (typeof index == 'object') {
				index = 0;
				attr  = index;
			}
			atom.dom.create(tagName, attr).appendTo( this.get(index) );
			return this;
		},
		each : function (fn) {
			this.elems.forEach(fn.bind(this));
			return this;
		},
		attr : function (attr) {
			attr = setter(arguments);
			if (typeof attr == 'string') {
				return this.first.getAttribute(attr);
			}
			return this.each(function (elem) {
				for (var i in attr) elem.setAttribute(i, attr[i]);
			});
		},
		css : function (css) {
			css = setter(arguments);
			if (typeof css == 'string') {
				return window.getComputedStyle(this.first, "").getPropertyValue(css);
			}
			return this.each(function (elem) {
				for (var i in css) {
					var value = css[i];
					if (typeof value == 'number' && !ignoreCssPostfix[i]) {
						value += 'px';
					}
					elem.style[camelCase(i)] = value;
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
		// todo: unbind
		delegate : function (selector, event, fn) {
			return this.bind(event, function (e) {
				if (new dom(e.target).is(selector)) {
					fn.apply(this, arguments);
				}
			});
		},
		wrap : function (wrapper) {
			wrapper = new dom(wrapper).first;
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
            if (!classNames) return this;

			if (!isArray(classNames)) classNames = [classNames];

			return this.each(function (elem) {
				var current = ' ' + elem.className + ' ';
				for (var i = classNames.length; i--;) {
					current = current.replace(' ' + classNames[i] + ' ', ' ');
				}
				elem.className = current.trim();
			});
		},
		hasClass: function(classNames) {
			if(!classNames) return false;

			if(!isArray(classNames)) classNames = [classNames];

			var result = false;
			this.each(function (elem) {
				var property = elem.className, current = ' ' + property + ' ';

				var elemResult = true;
				for (var i = classNames.length; i--;) {
					elemResult = elemResult && (current.indexOf(' ' + classNames[i] + ' ') >= 0);
				}

				result = result || elemResult;
			});
			return result;
		},
		toggleClass: function(classNames) {
			if(!classNames) return this;

			if(!isArray(classNames)) classNames = [classNames];

			return this.each(function (elem) {
				var property = elem.className, current = ' ' + property + ' ';

				for (var i = classNames.length; i--;) {
					var c = ' ' + classNames[i];
					if (current.indexOf(c + ' ') < 0) current = c + current;
					else current = current.replace(c + ' ', ' ');
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


/*
---

name: "Ajax"

description: "todo"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom

provides: ajax

...
*/

(function () {
	var extend = atom.extend, emptyFn = function () { return function(){}; };
	var ajax = function (userConfig) {
		var config     = extend(extend({}, ajax.defaultProps  ), userConfig);
		config.headers = extend(extend({}, ajax.defaultHeaders), userConfig.headers);

		var req = new XMLHttpRequest();
		for (var i in config.headers) req.setRequestHeader(i, config.headers[i]);
		req.onreadystatechange = ajax.onready(req, config);
		req.open(config.method.toUpperCase(), config.url, true);
		req.send(null);
	};

	ajax.defaultProps = {
		interval: 0,
		type    : 'plain',
		method  : 'post',
		url     : location.href,
		onLoad  : emptyFn(),
		onError : emptyFn()
	};

	ajax.defaultHeaders = {
		'X-Requested-With': 'XMLHttpRequest',
		'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
	};
	ajax.onready = function (req, config) {
		return function (e) {
			if (req.readyState == 4) {
				if (req.status != 200) return config.onError(e);

				var result = req.responseText;
				if (config.type.toLowerCase() == 'json') {
					result = JSON.parse(result);
				}
				if (config.interval > 0) setTimeout(function () {
					atom.ajax(config);
				}, config.interval * 1000);
				config.onLoad(result);
			}
		};
	};

	extend({ ajax : ajax });
})();


/*
---

name: "Ajax.Dom"

description: todo

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom
	- dom
	- ajax

provides: ajax.dom

...
*/

atom.implement(atom.dom, {
	ajax : function (config) {
		config = atom.extend({
			onload: function (res) {
				this.get().innerHTML = res;
			},
			onerror: function(){}
		}, config);


		atom.ajax(atom.extend(config, {
			onError: config.onError.bind(this),
			onLoad : config.onLoad .bind(this)			
		}));
		return this;
	}
});


/*
---

name: "Cookie"

description: "todo"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom

provides: cookie

...
*/

atom.extend({
	cookie: {
		get: function (name) {
			var matches = document.cookie.match(new RegExp(
			  "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
			));
			return matches ? decodeURIComponent(matches[1]) : null;
		},
		set: function (name, value, options) {
			options = options || {};
			var exp = options.expires;
			if (exp) {
				if (exp.toUTCString) {
					exp = exp.toUTCString();
				} else if (typeof exp == 'number') {
					exp = exp * 1000 * Date.now();
				}
				options.expires = exp;
			}

			var cookie = [name + "=" + encodeURIComponent(value)];
			for (var o in options) cookie.push(
				options[o] === true ? o : o + "=" + options[o]
			);
			document.cookie = cookie.join('; ');

			return atom.cookie;
		},
		del: function (name) {
			return atom.cookie.set(name, null, { expires: -1 });
		}
	}
});

/*
---

name: "Uri"

description: "Port of parseUri function"

license: "MIT License"

author: "Steven Levithan <stevenlevithan.com>"

requires:
	- atom

provides: uri

...
*/
new function () {

var uri = function (str) {
	var	o   = atom.uri.options,
		m   = o.parser.exec(str || window.location.href),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};
uri.options = {
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
};

atom.extend({ uri: uri });

};

/*
---

name: "Class"

description: "Contains the Class Function for easily creating, extending, and implementing reusable Classes."

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom
	- accessors

inspiration:
  - "[MooTools](http://mootools.net)"

provides: Class

...
*/


(function(atom){

var typeOf = atom.typeOf,
	extend = atom.extend,
	accessors = atom.accessors.inherit,
	prototype = 'prototype',
	lambda    = function (value) { return function () { return value; }};

var Class = function (params) {
	if (Class.$prototyping) return this;

	if (typeOf(params) == 'function') params = { initialize: params };

	var Constructor = function(){
		if (this instanceof Constructor) {
			if (Constructor.$prototyping) return this;
			return this.initialize ? this.initialize.apply(this, arguments) : this;
		} else {
			return Constructor.invoke.apply(Constructor, arguments);
		}
	};
	extend(Constructor, Class);
	Constructor[prototype] = getInstance(Class);
	Constructor
		.implement(params, false)
		.reserved(true, {
			parent: parent,
			self  : Constructor
		})
		.reserved({
			factory : new function() {
				function Factory(args) { return Constructor.apply(this, args); }
				Factory[prototype] = Constructor[prototype];
				return function(args) { return new Factory(args || []); }
			}
		});

	return Constructor;
};

var parent = function(){
	if (!this.$caller) throw new Error('The method «parent» cannot be called.');
	var name     = this.$caller.$name,
		parent   = this.$caller.$owner.parent,
		previous = parent && parent[prototype][name];
	if (!previous) throw new Error('The method «' + name + '» has no parent.');
	return previous.apply(this, arguments);
};

var wrap = function(self, key, method){
	// if method is already wrapped
	if (method.$origin) method = method.$origin;
	
	var wrapper = function() {
		if (method.$protected && !this.$caller) throw new Error('The method «' + key + '» is protected.');
		var current = this.$caller;
		this.$caller = wrapper;
		var result = method.apply(this, arguments);
		this.$caller = current;
		return result;
	};
	wrapper.$owner  = self;
	wrapper.$origin = method;
	wrapper.$name   = key;
	
	return wrapper;
};

var getInstance = function(Class){
	Class.$prototyping = true;
	var proto = new Class;
	delete Class.$prototyping;
	return proto;
};

Class.extend =  function (name, fn) {
	if (typeof name == 'string') {
		var object = {};
		object[name] = fn;
	} else {
		object = name;
	}

	for (var i in object) if (!accessors(object, this, i)) {
		 this[i] = object[i];
	}
	return this;
};

Class.extend({
	implement: function(name, fn, retain){
		if (typeof name == 'string') {
			var params = {};
			params[name] = fn;
		} else {
			params = name;
			retain = fn;
		}

		for (var key in params) {
			if (!accessors(params, this[prototype], key)) {
				var value = params[key];

				if (Class.Mutators.hasOwnProperty(key)){
					value = Class.Mutators[key].call(this, value);
					if (value == null) continue;
				}

				if (typeOf(value) == 'function'){
					if (value.$origin) value = value.$origin;
					if (value.$hidden == 'next') {
						value.$hidden = true
					} else if (value.$hidden) {
						continue;
					}
					this[prototype][key] = (retain) ? value : wrap(this, key, value);
				} else {
					this[prototype][key] = atom.clone(value);
				}
			}
		}
		return this;
	},
	mixin: function () {
		atom.toArray(arguments).forEach(function (item) {
			this.implement(getInstance(item));
		}.bind(this));
		return this;
	},
	reserved: function (toProto, props) { // use careful !!
		if (arguments.length == 1) {
			props = toProto;
			toProto = false;
		}
		var target = toProto ? this[prototype] : this;
		for (var name in props) {
			atom.accessors.define(target, name, { get: lambda(props[name]) });
		}
		return this;
	},
	isInstance: function (object) {
		return object instanceof this;
	},
	invoke: function () {
		return this.factory( arguments );
	},
	Mutators: {
		Extends: function(parent){
			if (parent == null) throw new TypeError('Cant extends from null');
			this.extend(parent).reserved({ parent: parent });
			this[prototype] = getInstance(parent);
		},

		Implements: function(items){
			this.mixin.apply(this, items);
		},

		Static: function(properties) {
			this.extend(properties);
		}
	},
	abstractMethod: function () {
		throw new Error('Abstract Method «' + this.$caller.$name + '» called');
	},
	protectedMethod: function (fn) {
		return extend(fn, { $protected: true });
	},
	hiddenMethod: function (fn) {
		return extend(fn, { $hidden: 'next' });
	}
});

extend({ Class: Class });

})(atom);

/*
---

name: "Class.Events"

description: ""

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom
	- Class

inspiration:
  - "[MooTools](http://mootools.net)"

provides: Class.Events

...
*/

new function () {

var Class = atom.Class;

var fire = function (name, fn, args, onfinish) {
	var result = fn.apply(this, Array.from(args || []));
	if (typeof result == 'string' && result.toLowerCase() == 'removeevent') {
		onfinish.push(this.removeEvent.context(this, [name, fn]));
	}
};

var removeOn = function(string){
	return (string || '').replace(/^on([A-Z])/, function(full, first){
		return first.toLowerCase();
	});
};

var initEvents = function (object) {
	if (!object._events) object._events = { $ready: {} };
};

var nextTick = function (fn) {
	nextTick.fn.push(fn);
	if (!nextTick.id) {
		nextTick.id = function () {
			nextTick.reset().invoke();
		}.delay(1);
	}
};
nextTick.reset = function () {
	var fn = nextTick.fn;
	nextTick.fn = [];
	nextTick.id = 0;
	return fn;
};
nextTick.reset();

atom.extend(Class, {
	Events: Class({
		addEvent: function(name, fn) {
			initEvents(this);

			var i, l, onfinish = [];
			if (arguments.length == 1 && typeof name != 'string') {
				for (i in name) {
					this.addEvent(i, name[i]);
				}
			} else if (Array.isArray(name)) {
				for (i = 0, l = name.length; i < l; i++) {
					this.addEvent(name[i], fn);
				}
			} else {
				name = removeOn(name);
				if (name == '$ready') {
					throw new TypeError('Event name «$ready» is reserved');
				} else if (!fn) {
					throw new TypeError('Function is empty');
				} else {
					Object.ifEmpty(this._events, name, []);

					this._events[name].include(fn);

					var ready = this._events.$ready[name];
					if (ready) fire.apply(this, [name, fn, ready, onfinish]);
					onfinish.invoke();
				}
			}
			return this;
		},
		removeEvent: function (name, fn) {
			initEvents(this);

			if (arguments.length == 1 && typeof name != 'string') {
				for (i in name) {
					this.addEvent(i, name[i]);
				}
			} else if (Array.isArray(name)) {
				for (var i = name.length; i--;) {
					this.removeEvent(name[i], fn);
				}
				return this;
			} else {
				name = removeOn(name);
				if (name == '$ready') {
					throw new TypeError('Event name «$ready» is reserved');
				}
				if (arguments.length == 1) {
					this._events[name] = [];
				} else if (name in this._events) {
					this._events[name].erase(fn);
				}
			}
			return this;
		},
		isEventAdded: function (name) {
			initEvents(this);
			
			var e = this._events[name];
			return !!(e && e.length);
		},
		fireEvent: function (name, args) {
			initEvents(this);
			
			name = removeOn(name);
			var funcs = this._events[name];
			if (funcs) {
				var onfinish = [],
					l = funcs.length,
					i = 0;
				for (;i < l; i++) fire.call(this, name, funcs[i], args || [], onfinish);
				onfinish.invoke();
			}
			return this;
		},
		readyEvent: function (name, args) {
			initEvents(this);
			
			nextTick(function () {
				name = removeOn(name);
				this._events.$ready[name] = args || [];
				this.fireEvent(name, args || []);
			}.context(this));
			return this;
		}
	})
});

};

/*
---

name: "Class.Options"

description: ""

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom
	- Class

inspiration:
  - "[MooTools](http://mootools.net)"

provides: Class.Options

...
*/

atom.Class.Options = atom.Class({
	options: {},
	setOptions: function(){
		if (!this.options) {
			this.options = {};
		} else if (this.options == this.self.prototype.options) {
			// it shouldn't be link to static options
			this.options = atom.clone(this.options);
		}

		for (var a = arguments, i = 0, l = a.length; i < l;) {
			atom.extend(this.options, a[i++]);
		}
		var options = this.options;
		
		if (this.addEvent) for (var option in options){
			if (atom.typeOf(options[option]) == 'function' && (/^on[A-Z]/).test(option)) {
				this.addEvent(option, options[option]);
				delete options[option];
			}
		}
		return this;
	}
});

/*
---

name: "Number"

description: "Contains Number Prototypes like limit, round, times, and ceil."

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom

provides: Number

...
*/

new function () {

'use strict';

atom.extend(Number, {
	random : function (min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
});

atom.implement(Number, {
	between: function (n1, n2, equals) {
		return (n1 <= n2) && (
			(equals == 'L' && this == n1) ||
			(equals == 'R' && this == n2) ||
			(  this  > n1  && this  < n2) ||
			([true,'LR','RL'].indexOf(equals) != -1 && (n1 == this || n2 == this))
		);
	},
	equals : function (to, accuracy) {
		if (arguments.length == 1) accuracy = 8;
		return this.toFixed(accuracy) == to.toFixed(accuracy);
	},
	limit: function(min, max){
		var bottom = Math.max(min, this);
		return arguments.length == 2 ?
			Math.min(max, bottom) : bottom;
	},
	round: function(precision){
		precision = Math.pow(10, precision || 0).toFixed(precision < 0 ? -precision : 0);
		return Math.round(this * precision) / precision;
	},
	toFloat: function(){
		return parseFloat(this);
	},
	toInt: function(base){
		return parseInt(this, base || 10);
	},
	stop: function() {
		var num = Number(this);
		if (num) {
			clearInterval(num);
			clearTimeout (num);
		}
		return this;
	}
});

['abs','acos','asin','atan','atan2','ceil','cos','exp','floor','log','max','min','pow','sin','sqrt','tan']
	.forEach(function(method) {
		if (Number[method]) return;
		
		Number.prototype[method] = function() {
			return Math[method].apply(null, [this].append(arguments));
		};
	});

};

/*
---

name: "Array"

description: "Contains Array Prototypes like include, contains, and erase."

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom
	- Number

provides: Array

...
*/

new function (undefined) {
'use strict';

var slice = [].slice;

atom.extend(Array, {
	range: function (from, to, step) {
		step = (step * 1).limit(0) || 1;
		var result = [];
		do {
			result.push(from);
			from += step;
		} while (from <= to);
		return result;
	},
	from: atom.toArray,
	pickFrom: function (args) {
		return Array.from(
			   args
			&& args.length == 1
			&& ['array', 'arguments'].contains(atom.typeOf(args[0])) ?
				args[0] : args
		);
	},
	fill: function (array, fill) {
		array = Array.isArray(array) ? array : new Array(array * 1);
		for (var i = array.length; i--;) array[i] = fill;
		return array;
	},
	fillMatrix: function (width, height, fill) {
		var array = new Array(height);
		while (height--) {
			array[height] = Array.fill(width, fill);
		}
		return array;
	},
	collect: function (obj, props, Default) {
		var array = [];
		for (var i in props.toKeys()) array.push(i in obj ? obj[i] : Default);
		return array;
	},
	create: function (length, fn) {
		var array = new Array(length);
		for (var i = 0; i < length; i++) array[i] = fn(i, array);
		return array;
	},
	toHash: function () {
		for (var hash = {}, i = 0, l = this.length; i < l; i++) hash[i] = this[i];
		return hash;
	}
});

atom.implement(Array, {
	get last(){
		return this.length ? this[this.length - 1] : null;
	},
	get random(){
		return this.length ? this[Number.random(0, this.length - 1)] : null;
	},
	popRandom: function () {
		if (this.length == 0) return null;
		var index = Number.random(0, this.length - 1), elem = this[index];
		this.splice(index, 1);
		return elem;
	},
	// Correctly works with `new Array(10).fullMap(fn)`
	fullMap: function (fn, bind) {
		var mapped = new Array(this.length);
		for (var i = 0, l = mapped.length; i < l; i++) {
			mapped[i] = fn.call(bind, this[i], i, this);
		}
		return mapped;
	},
	contains: function (elem, fromIndex) {
		return this.indexOf(elem, fromIndex) != -1;
	},
	include: function(item){
		if (!this.contains(item)) this.push(item);
		return this;
	},
	append: function (array) {
		for (var i = 0, l = arguments.length; i < l; i++) {
			this.push.apply(this, arguments[i]);
		}
		return this;
	},
	erase: function(item){
		for (var i = this.length; i--;) {
			if (this[i] === item) this.splice(i, 1);
		}
		return this;
	},
	toKeys: function (value) {
		var useValue = arguments.length == 1, obj = {};
		for (var i = 0, l = this.length; i < l; i++)
			obj[this[i]] = useValue ? value : i;
		return obj;
	},
	combine: function(array){
		for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
		return this;
	},
	pick: function(){
		for (var i = 0, l = this.length; i < l; i++) {
			if (this[i] != null) return this[i];
		}
		return null;
	},
	invoke: function(context){
		var args = slice.call(arguments, 1);
		if (typeof context == 'string') {
			var methodName = context;
			context = null;
		}
		return this.map(function(item){
			return item && (methodName ? item[methodName] : item).apply(methodName ? item : context, args);
		});
	},
	shuffle : function () {
		for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
		return this;
	},
	sortBy : function (method, reverse) {
		var get = function (elem) {
			return typeof elem[method] == 'function' ? elem[method]() : (elem[method] || 0);
		};
		var multi = reverse ? -1 : 1;
		return this.sort(function ($0, $1) {
			var diff = get($1) - get($0);
			return diff ? (diff < 0 ? -1 : 1) * multi : 0;
		});
	},
	min: function(){
		return Math.min.apply(null, this);
	},
	max: function(){
		return Math.max.apply(null, this);
	},
	mul: function (factor) {
		for (var i = this.length; i--;) this[i] *= factor;
		return this;
	},
	add: function (number) {
		for (var i = this.length; i--;) this[i] += number;
		return this;
	},
	average: function(){
		return this.length ? this.sum() / this.length : 0;
	},
	sum: function(){
		for (var result = 0, i = this.length; i--;) result += this[i];
		return result;
	},
	unique: function(){
		return [].combine(this);
	},
	associate: function(keys){
		var obj = {}, length = this.length, i, isFn = atom.typeOf(keys) == 'function';
		if (!isFn) length = Math.min(length, keys.length);
		for (i = 0; i < length; i++) {
			obj[(isFn ? this : keys)[i]] = isFn ? keys(this[i], i) : this[i];
		}
		return obj;
	},
	clean: function (){
		return this.filter(function (item) { return item != null; });
	},
	empty: function () {
		this.length = 0;
		return this;
	},
	clone: function () {
		return atom.clone(this);
	},
	hexToRgb: function(array){
		if (this.length != 3) return null;
		var rgb = this.map(function(value){
			if (value.length == 1) value += value;
			return parseInt(value, 16);
		});
		return (array) ? rgb : 'rgb(' + rgb + ')';
	},
	rgbToHex: function(array) {
		if (this.length < 3) return null;
		if (this.length == 4 && this[3] == 0 && !array) return 'transparent';
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (this[i] - 0).toString(16);
			hex.push((bit.length == 1) ? '0' + bit : bit);
		}
		return (array) ? hex : '#' + hex.join('');
	},

	reduce: [].reduce || function(fn, value){
		for (var i = 0, l = this.length; i < l; i++){
			if (i in this) value = value === undefined ? this[i] : fn.call(null, value, this[i], i, this);
		}
		return value;
	},

	reduceRight: [].reduceRight || function(fn, value){
		for (var i = this.length; i--;){
			if (i in this) value = value === undefined ? this[i] : fn.call(null, value, this[i], i, this);
		}
		return value;
	}
});

};

/*
---

name: "Function"

description: "Contains Function Prototypes like context, periodical and delay."

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom
	- Array

provides: Function

...
*/

new function () {
'use strict';

	var getContext = function (bind, self) {
		return (bind === false || bind === Function.context) ? self : bind;
	};

	var slice = [].slice;

	atom.extend(Function, {
		lambda : function (value) {
			var returnThis = (arguments.length == 0);
			return function () { return returnThis ? this : value; };
		},
		copier: function (value) {
			return function () { return atom.clone(value); }
		},
		log: function (msg) {
			var args = arguments.length ? arguments : null;
			return function () {
				atom.log.apply(atom, args || [this]);
			};
		},
		// for pointing at "this" context in "context" method
		context: {}
	});

	atom.implement(Function, {
		context: function(bind, args){
			var fn = this;
			args = args ? atom.toArray(args) : [];
			return function(){
				return fn.apply(getContext(bind, this), [].append(args, arguments));
			};
		},
		only: function(numberOfArgs, bind) {
			var fn = this;
			return function() {
				return fn.apply(getContext(bind, this), slice.call(arguments, 0, numberOfArgs))
			};
		}
	});

	var timeout = function (name) {
		var set = {
			Timeout : setTimeout,
			Interval: setInterval
		}[name];

		return function (time, bind, args) {
			return set.call(window, this.context(bind, args), time);
		};
	};
	
	atom.implement(Function, {
		delay:      timeout('Timeout'),
		periodical: timeout('Interval')
	});
}(); 


/*
---

name: "Object"

description: "Object generic methods"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom

provides: Object

...
*/

atom.extend(Object, {
	invert: function (object) {
		var newObj = {};
		for (var i in object) newObj[object[i]] = i;
		return newObj;
	},
	collect: function (obj, props, Default) {
		var newObj = {};
		for (var i in props.toKeys()) {
			newObj[i] = i in obj ? obj[i] : Default;
		}
		return newObj;
	},
	keys: function (obj) {
		var keys = [];
		for (var i in obj) keys.push(i);
		return keys;
	},
	values: function (obj) {
		var values = [];
		for (var i in obj) values.push(obj[i]);
		return values;
	},
	isDefined: function (obj) {
		return typeof obj != 'undefined';
	},
	isReal: function (obj) {
		return obj || obj === 0;
	},
	map: function (obj, fn) {
		var mapped = {};
		for (var i in obj) if (obj.hasOwnProperty(i)) {
			mapped[i] = fn( obj[i], i, obj );
		}
		return mapped;
	},
	max: function (obj) {
		var max = null, key = null;
		for (var i in obj) if (max == null || obj[i] > max) {
			key = i;
			max = obj[i];
		}
		return key;
	},
	min: function (obj) {
		var min = null, key = null;
		for (var i in obj) if (min == null || obj[i] < min) {
			key = i;
			min = obj[i];
		}
		return key;
	},
	deepEquals: function (first, second) {
		if (!first || (typeof first) !== (typeof second)) return false;

		for (var i in first) {
			var f = first[i], s = second[i];
			if (typeof f === 'object') {
				if (!s || !Object.deepEquals(f, s)) return false;
			} else if (f !== s) {
				return false;
			}
		}

		for (i in second) if (!(i in first)) return false;

		return true;
	},
	ifEmpty: function (object, key, defaultValue) {
		if (!(key in object)) {
			object[key] = defaultValue;
		}
		return object;
	},
	path: {
		parts: function (path, delimiter) {
			return Array.isArray(path) ? path : String(path).split( delimiter || '.' );
		},
		get: function (object, path, delimiter) {
			if (!path) return object;

			path = Object.path.parts( path, delimiter );

			for (var i = 0; i < path.length; i++) {
				if (object != null && path[i] in object) {
					object = object[path[i]];
				} else {
					return;
				}
			}

			return object;
		},
		set: function (object, path, value, delimiter) {
			path = Object.path.parts( path, delimiter );

			var key = path.pop();

			object = Object.path.get( object, path.length > 0 && path, delimiter );

			if (object == null) {
				return false;
			} else {
				object[key] = value;
				return true;
			}
		}
	}
});

/*
---

name: "String"

description: "Contains String Prototypes like repeat, substitute, replaceAll and begins."

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom

provides: String

...
*/

new function () {

'use strict';

var substituteRE = /\\?\{([^{}]+)\}/g,
	safeHtmlRE = /[<'&">]/g,
	UID = Date.now();

String.uniqueID = function () {
	return (UID++).toString(36);
};

atom.implement(String, {
	safeHtml: function () {
		return this.replaceAll(safeHtmlRE, {
			'&'  : '&amp;',
			'\'' : '&#039;',
			'\"' : '&quot;',
			'<'  : '&lt;',
			'>'  : '&gt;'
		});
	},
	repeat: function(times) {
		return new Array(times + 1).join(this);
	},
	substitute: function(object, regexp){
		return this.replace(regexp || substituteRE, function(match, name){
			return (match[0] == '\\') ? match.slice(1) : (object[name] == null ? '' : object[name]);
		});
	},
	replaceAll: function (find, replace) {
		var type = atom.typeOf(find);
		if (type == 'regexp') {
			return this.replace(find, function (symb) { return replace[symb]; });
		} else if (type == 'object') {
			var result = this;
			for (var i in find) result = result.replaceAll(i, find[i]);
			return result;
		}
		return this.split(find).join(replace);
	},
	begins: function (w, caseInsensitive) {
		return (!caseInsensitive) ? w == this.substr(0, w.length) :
			w.toLowerCase() == this.substr(0, w.length).toLowerCase();
	},
	ends: function (w, caseInsensitive) {
		return (!caseInsensitive) ? w == this.substr(this.length - w.length) :
			w.toLowerCase() == this.substr(this.length - w.length).toLowerCase();
	},
	ucfirst : function () {
		return this[0].toUpperCase() + this.substr(1);
	},
	lcfirst : function () {
		return this[0].toLowerCase() + this.substr(1);
	},
	trim: ''.trim || function () {
		return this.trimLeft().trimRight();
	},
	trimLeft : ''.trimLeft || function () {
		return this.replace(/^\s+/, '');
	},
	trimRight: ''.trimRight || function () {
		return this.replace(/\s+$/, '');
	}
});

}();


/*
---

name: "Class.Mutators.Generators"

description: "Provides Generators mutator"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- atom
	- accessors
	- Class

provides: Class.Mutators.Generators

...
*/

new function () {

var getter = function (key, fn) {
	return function() {
		var pr = '_' + key, obj = this;
		return pr in obj ? obj[pr] : (obj[pr] = fn.call(obj));
	};
};

atom.Class.Mutators.Generators = function(properties) {
	for (var i in properties) atom.accessors.define(this.prototype, i, { get: getter(i, properties[i]) });
};

};
 
