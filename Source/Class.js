/*
---

name: "Class"

description: "Contains the Class Function for easily creating, extending, and implementing reusable Classes."

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom]

inspiration:
  - "[MooTools](http://mootools.net)"

provides: [atom.Class]

...
*/


(function(){

var atom = this.atom,
	typeOf = atom.typeOf,
	extend = atom.extend,
	accessors = atom.implementAccessors,
	prototype = 'prototype';

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
			} else if (typeOf(value) == 'object') {
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

var lambda = function (value) { return function () { return value; }};

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
	privateMethod: function (fn) {
		return extend(fn, { $hidden: 'next' });
	}
});

extend({ Class: Class });

})();