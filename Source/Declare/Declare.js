/*
---

name: "Declare"

description: "Contains the Class Function for easily creating, extending, and implementing reusable Classes."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom
	- accessors

provides: declare

...
*/

var declare = (function(atom){

var
	declare, methods,
	accessors   = atom.accessors.inherit,
	factory     = false,
	prototyping = false,
	mutators    = [];

declare = function (declareName, params) {
	if (prototyping) return this;

	if (typeof declareName != 'string') {
		params = declareName;
		declareName   = null;
	}

	if (!params      ) params = {};
	if (!params.proto) params = { proto: params };
	if (!params.name ) params.name = declareName;
	if (!params.proto.initialize) {
		params.proto.initialize = function () {
			if (!params.parent) return;
			return params.parent.prototype.initialize.apply(this, arguments);
		};
	}

	// we need this for shorter line in chrome debugger;
	function make (a) {
		return methods.construct.call(this, Constructor, a);
	}

	// line break for more user-friendly debug string
	function Constructor()
	{ return make.call(this, arguments) }

	for (var i = 0, l = mutators.length; i < l; i++) {
		mutators[i].fn( Constructor, params[mutators[i].name] );
	}

	Constructor.prototype.constructor = Constructor;

	if (declareName) methods.define( declareName, Constructor );

	return Constructor;
};

declare.prototype.bindMethods = function (methods) {
	var i = methods.length, name;
	while (i--) {
		name = methods[i];
		this[name] = this[name].bind(this);
	}
	return this;
};

declare.invoke = function () {
	return this.factory( arguments );
};

declare.factory = function (args) {
	factory = true;
	return new this(args);
};

methods = {
	define: function (path, value) {
		var key, part, target = atom.global;

		path   = path.split('.');
		key    = path.pop();

		while (path.length) {
			part = path.shift();
			if (!target[part]) {
				target = target[part] = {};
			} else {
				target = target[part];
			}
		}

		target[key] = value;
	},
	mixin: function (target, items) {
		if (!Array.isArray(items)) items = [ items ];
		for (var i = 0, l = items.length; i < l; i++) {
			methods.addTo( target.prototype, methods.proto(items) );
		}
		return this;
	},
	addTo: function (target, source) {
		for (var i in source) if (i != 'constructor') {
			if (!accessors(source, target, i)) {
				if (source[i] != declare.config) {
					target[i] = source[i];
				}
			}
		}
		return target;
	},
	proto: function (Fn) {
		prototyping = true;
		var result = new Fn;
		prototyping = false;
		return result;
	},
	fetchArgs: function (args) {
		args = slice.call(factory ? args[0] : args);
		factory = false;
		return args;
	},
	construct: function (Constructor, args) {
		args = methods.fetchArgs(args);

		if (prototyping) return this;

		if (this instanceof Constructor) {
			return this.initialize.apply(this, args);
		} else {
			return Constructor.invoke.apply(Constructor, args);
		}
	}
};

declare.config = {
	methods: methods,
	mutator: atom.overloadSetter(function (name, fn) {
		mutators.push({ name: name, fn: fn });
		return this;
	})
};

declare.config.mutator({
	parent: function (Constructor, parent) {
		parent = parent || declare;
		methods.addTo( Constructor, parent );
		Constructor.prototype = methods.proto( parent );
	},
	mixin: function (Constructor, mixin) {
		if (mixin) mixin( Constructor, mixin );
	},
	name: function (Constructor, name) {
		if (!name) return;
		Constructor.NAME = name;
	},
	own: function (Constuctor, properties) {
		methods.addTo(Constuctor, properties);
	},
	proto: function (Constuctor, properties) {
		methods.addTo(Constuctor.prototype, properties);
	}
});

return atom.declare = declare;

})(atom);