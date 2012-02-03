/*
---

name: "Declare"

description: "Contains the Class Function for easily creating, extending, and implementing reusable Classes."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- Core
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
		declareName = null;
	}

	if (!params) params = {};
	if (!params.prototype) {
		params.prototype = params.proto || params;
	}
	if (!params.name) params.name = declareName;
	if (!params.prototype.initialize) {
		params.prototype.initialize = function () {
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
	var i;

	if (typeof methods == 'string') {
		if (typeof this[methods] == 'function') {
			this[methods] = this[methods].bind(this);
		}
		return this;
	}

	if (!methods) {
		for (i in this) this.bindMethods(i);
		return this;
	}

	for (i = methods.length; i--;) this.bindMethods( methods[i] );
	return this;
};

declare.prototype.toString = function () {
	return '[object ' + (this.constructor.NAME || 'Declare') + ']';
};

declare.NAME = 'atom.declare';

declare.invoke = function () {
	return this.factory( arguments );
};

declare.factory = function (args) {
	factory = true;
	return new this(args);
};

declare.castArguments = function (args) {
	if (args == null) return null;

	var constructor = this;

	return (args != null && args[0] && args[0] instanceof constructor) ?
		args[0] : args instanceof constructor ? args : new constructor( args );
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
			methods.addTo( target.prototype, methods.proto(items[i]) );
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
			if (Constructor.NAME) this.Constructor = Constructor.NAME;
			return this.initialize.apply(this, args);
		} else {
			return Constructor.invoke.apply(Constructor, args);
		}
	}
};

declare.config = {
	methods: methods,
	mutator: atom.core.overloadSetter(function (name, fn) {
		mutators.push({ name: name, fn: fn });
		return this;
	})
};

declare.config.mutator({
	parent: function (Constructor, parent) {
		parent = parent || declare;
		methods.addTo( Constructor, parent );
		Constructor.prototype = methods.proto( parent );
		Constructor.Parent    = parent;
	},
	mixin: function (Constructor, mixins) {
		if (mixins) methods.mixin( Constructor, mixins );
	},
	name: function (Constructor, name) {
		if (!name) return;
		Constructor.NAME = name;
	},
	own: function (Constuctor, properties) {
		methods.addTo(Constuctor, properties);
	},
	prototype: function (Constuctor, properties) {
		methods.addTo(Constuctor.prototype, properties);
	}
});

return atom.declare = declare;

})(atom);