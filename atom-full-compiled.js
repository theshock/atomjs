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

(function () {
	var prototype = 'prototype',
	    apply = 'apply',
		toString = Object[prototype].toString;


	var Atom = function () {
		return atom.initialize[apply](this, arguments);
	};

	var atom = (this.window || GLOBAL).atom = function () {
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
		for (var i in from) if (i != 'constructor') {
			if (safe && i in ext) continue;

			if ( !implementAccessors(from, ext, i) ) {
				ext[i] = clone(from[i]);
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
		} else if (item && item.callee && typeof item.length == 'number'){
			return 'arguments';
		}
		
		var type = typeof item;
		
		return (type == 'object' && atom.Class && item instanceof atom.Class) ? 'class' : type;
	};
	typeOf.textnodeRE = /\S/;
	typeOf.types = {};
	['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Class'].forEach(function(name) {
		typeOf.types['[object ' + name + ']'] = name.toLowerCase();
	});

	var implementAccessors = function (from, to, key) {
		if (arguments.length == 2) {
			// only for check if is accessor
			key = to;
			to  = null;
		}
		// #todo: implement with getOwnPropertyDescriptor && defineProperty
		
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
			if (typeof object.clone == 'function') return object.clone();
			
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
			try {
				return console.log[apply](console, arguments);
			} catch (e) { return false; }
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

	var atomFactory = function (args) {
		return Atom[apply](this, args);
	};
	atomFactory[prototype] = Atom[prototype];


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
		if (! (this instanceof dom)) return new dom(sel, context);

		if (!arguments[length]) {
			this.elems = [doc];
			return this;
		}

		if (context !== undefined) {
			return new dom(context || doc).find(sel);
		}
		context = context || doc;

		if (typeof sel == 'function' && !sel instanceof dom) {
			// onDomReady
			var fn = sel.bind(this, atom, dom);
			domReady ? setTimeout(fn, 1) : onDomReady.push(fn);
			return this;
		}

		this.elems = (sel instanceof HTMLCollection) ? toArray(sel)
			: (typeof sel == 'string') ? dom.query(context, sel)
			: (sel instanceof dom)     ? sel.elems
			: (isArray(sel))           ? sel
			:                            dom.find(context, sel);

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
		// todo: unbind
		delegate : function (tagName, event, fn) {
			return this.bind(event, function (e) {
				if (e.target.tagName.toLowerCase() == tagName.toLowerCase()) {
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

name: "Uri"

description: "Port of parseUri function"

license: "MIT License"

author: "Steven Levithan <stevenlevithan.com>"

requires:
	- atom

provides: uri

...
*/
atom.extend({
	uri: atom.extend(function (str) {
		var	o   = atom.uri.options,
			m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str || window.location.href),
			uri = {},
			i   = 14;

		while (i--) uri[o.key[i]] = m[i] || "";

		uri[o.q.name] = {};
		uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
			if ($1) uri[o.q.name][$1] = $2;
		});

		return uri;
	}, {
		options: {
			strictMode: false,
			key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
			q:   {
				name:   "queryKey",
				parser: /(?:^|&)([^&=]*)=?([^&]*)/g
			},
			parser: {
				strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
				loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
			}
		}
	})
});

/*
---

name: "Class"

description: "Contains the Class Function for easily creating, extending, and implementing reusable Classes."

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom

inspiration:
  - "[MooTools](http://mootools.net)"

provides: Class

...
*/


(function(atom){

var typeOf = atom.typeOf,
	extend = atom.extend,
	accessors = atom.implementAccessors,
	prototype = 'prototype',
	lambda    = function (value) { return function () { return value; }};

var Class = function (params) {
	if (Class.$prototyping) {
		reset(this);
		return this;
	}

	if (typeOf(params) == 'function') params = {initialize: params};

	var newClass = function(){
		reset(this);
		if (newClass.$prototyping) return this;
		return this.initialize ? this.initialize.apply(this, arguments) : this;
	};
	extend(newClass, Class);
	newClass[prototype] = getInstance(Class);
	newClass
		.implement(params, false)
		.reserved(true, {
			parent: parent,
			self  : newClass
		})
		.reserved({
			factory : (function() {
				// Должно быть в конце, чтобы успел создаться прототип
				function F(args) { return newClass.apply(this, args); }
				F[prototype] = newClass[prototype];
				return function(args) { return new F(args || []); }
			})()
		});

	return newClass;
};

var parent = function(){
	if (!this.$caller) throw new Error('The method «parent» cannot be called.');
	var name = this.$caller.$name,
		parent = this.$caller.$owner.parent,
		previous = parent && parent[prototype][name];
	if (!previous) throw new Error('The method «' + name + '» has no parent.');
	return previous.apply(this, arguments);
};

var reset = function(object){
	for (var key in object) if (!accessors(object, key)) {
		var value = object[key];
		if (value && typeof value == 'object') {
			if ('clone' in value) {
				object[key] = (typeof value.clone == 'function') ?
					value.clone() : value.clone;
			} else { // if (typeOf(value) == 'object') {
				var F = function(){};
				F[prototype] = value;
				object[key] = reset(new F);
			}
		} else {
			object[key] = value;
		}
	}
	return object;
};

var wrap = function(self, key, method){
	// if method is already wrapped
	if (method.$origin) method = method.$origin;
	
	var wrapper = extend(function(){
		if (method.$protected && !this.$caller) throw new Error('The method «' + key + '» is protected.');
		var current = this.$caller;
		this.$caller = wrapper;
		var result = method.apply(this, arguments);
		this.$caller = current;
		return result;
	}, {$owner: self, $origin: method, $name: key});
	
	return wrapper;
};

extend(Class, {
	extend: function (name, fn) {
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
	},
	implement: function(name, fn, retain){
		if (typeof name == 'string') {
			var params = {};
			params[name] = fn;
		} else {
			params = name;
			retain = fn;
		}

		for (var key in params) if (!accessors(params, this[prototype], key)) {
			var value = params[key];

			if (Class.Mutators.hasOwnProperty(key)){
				value = Class.Mutators[key].call(this, value);
				if (value == null) continue;
			}

			if (typeOf(value) == 'function'){
				if (value.$hidden == 'next') {
					value.$hidden = true
				} else if (value.$hidden) {
					continue;
				}
				this[prototype][key] = (retain) ? value : wrap(this, key, value);
			} else {
				atom.merge(this[prototype], key, value);
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
	reserved: function (toProto, props) { // use carefull !!
		if (arguments.length == 1) {
			props = toProto;
			toProto = false;
		}
		var target = toProto ? this[prototype] : this;
		for (var name in props) {
			target.__defineGetter__(name, lambda(props[name]));
		}
		return this;
	},
	isInstance: function (object) {
		return object instanceof this;
	}
});

var getInstance = function(klass){
	klass.$prototyping = true;
	var proto = new klass;
	delete klass.$prototyping;
	return proto;
};

extend(Class, {
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
	abstractMethod: function (name) {
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
		_events: { $ready: {} },

		addEvent: function(name, fn) {
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
			var e = this._events[name];
			return !!(e && e.length);
		},
		fireEvent: function (name, args) {
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

atom.extend(atom.Class, {
	Options: atom.Class({
		setOptions: function(){
			var args = [{}, this.options].append(arguments);
			var options = this.options = atom.merge.apply(null, args);
			if (this.addEvent) for (var option in options){
				if (atom.typeOf(options[option]) == 'function' && (/^on[A-Z]/).test(option)) {
					this.addEvent(option, options[option]);
					delete options[option];
				}
			}
			return this;
		}
	})
});

/*
---

name: "Array"

description: "Contains Array Prototypes like include, contains, and erase."

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom

provides: Array

...
*/

atom.extend(Array, 'safe', {
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
		array = Array.isArray(array) ? array : new Array(1 * array);
		for (var i = array.length; i--;) array[i] = fill;
		return array;
	},
	collect: function (obj, props, Default) {
		var array = [];
		for (var i in props.toKeys()) array.push(i in obj ? obj[i] : Default);
		return array;
	},
	toHash: function () {
		for (var hash = {}, i = 0, l = this.length; i < l; i++) hash[i] = this[i];
		return hash;
	}
});

atom.implement(Array, 'safe', {
	contains: function (elem) {
		return this.indexOf(elem) != -1;
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
		for (var i = this.length; i--;) if (this[i] === item) this.splice(i, 1);
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
	last: function(){
		return this.length ? this[this.length - 1] : null;
	},
	random: function(){
		return this.length ? this[Number.random(0, this.length - 1)] : null;
	},
	pick: function(){
		for (var i = 0, l = this.length; i < l; i++){
			if (this[i] || this[i] === 0) return this[i];
		}
		return null;
	},
	invoke: function(context){
		var args = [].slice.call(arguments, 1);
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
		return this.filter(function (item) { return !!item; });
	},
	empty: function () {
		this.length = 0;
		return this;
	},
	clone: function () {
		return atom.clone(this);
	},
	hexToRgb: function(){
		if (this.length != 3) return null;
		return this.map(function(value){
			if (value.length == 1) value += value;
			return value.toInt(16);
		});
	},
	rgbToHex: function(){
		if (this.length < 3) return null;
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (this[i] - 0).toString(16);
			hex.push(bit.length == 1 ? '0' + bit : bit);
		}
		return hex;
	}
});

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
	var getContext = function (bind, self) {
		return (bind === false || bind === Function.context) ? self : bind;
	};
	
	atom.extend(Function, 'safe', {
		lambda : function (value) {
			var returnThis = (arguments.length == 0);
			return function () { return returnThis ? this : value; };
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

	atom.implement(Function, 'safe', {
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
				return fn.apply(getContext(bind, this), [].slice.call(arguments,0,numberOfArgs))
			};
		}
	});

	var timeout = {
		set : {
			Timeout : setTimeout,
			Interval: setInterval
		},
		clear : {
			Timeout : function () { clearTimeout (this); },
			Interval: function () { clearInterval(this); }
		},
		run: function (name, time, bind, args) {
			var result  = timeout.set[name].call(null, this.context(bind, args), time);
			result.stop = timeout.clear[name].context(result);
			return result;
		}
	};
	atom.implement(Function, 'safe', {
		delay:      timeout.run.context(Function.context, ['Timeout']),
		periodical: timeout.run.context(Function.context, ['Interval'])
	});
}(); 


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

atom.extend(Number, 'safe', {
	random : function (min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
});

atom.implement(Number, 'safe', {
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

atom.extend(Object, 'safe', {
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
		var callee = arguments.callee;
		for (var i in first) {
			var f = first[i], s = second[i];
			if (typeof f == 'object') {
				if (!s || !callee(f, s)) return false;
			} else if (f != s) {
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

var substituteRE = /\\?\{([^{}]+)\}/g,
	safeHtmlRE = /[<'&">]/g,
	UID = Date.now();

String.uniqueID = function () {
	return (UID++).toString(36);
};

atom.implement(String, 'safe', {
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
	ucfirst : function () {
		return this[0].toUpperCase() + this.substr(1);
	},
	lcfirst : function () {
		return this[0].toLowerCase() + this.substr(1);
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
	for (var i in properties) this.prototype.__defineGetter__(i, getter(i, properties[i]));
};

};
 
