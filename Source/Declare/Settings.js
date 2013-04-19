/*
---

name: "Settings"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- declare

provides: Settings

...
*/

/** @class atom.Settings */
declare( 'atom.Settings', {
	/** @private */
	recursive: false,

	/** @private */
	values: {},

	/**
	 * @constructs
	 * @param {Object} [initialValues]
	 */
	initialize: function (initialValues) {
		this.values    = {};

		if (initialValues) this.set(initialValues);
	},

	/**
	 * @param {atom.Events} events
	 * @return atom.Options
	 */
	addEvents: function (events) {
		this.events = events;
		return this.invokeEvents();
	},

	/**
	 * @param {string|Array} name
	 */
	get: function (name, defaultValue) {
		if (Array.isArray(name)) return this.subset(name, defaultValue);

		return name in this.values ? this.values[name] : defaultValue;
	},

	/**
	 * @test
	 * @param {object} target
	 * @param {string[]} names
	 * @return {atom.Settings}
	 */
	properties: function (target, names) {
		if (typeof names == 'string') {
			names = names.split(' ');
		}

		this['properties.names' ] = names == null ? true : names;
		this['properties.target'] = target;

		for (var i in this.values) {
			if (names === true || names.indexOf(i) >= 0) {
				target[i] = this.values[i];
			}
		}

		return this;
	},

	subset: function (names, defaultValue) {
		var i, values = {};

		for (i = names.length; i--;) {
			values[names[i]] = this.get( names[i], defaultValue );
		}

		return values;
	},

	/**
	 * @param {Object} options
	 * @return atom.Options
	 */
	set: function (options, value) {
		var i,
			values = this.values,
			target = this['properties.target'],
			names  = this['properties.names'];

		options = this.prepareOptions(options, value);

		for (i in options) {
			value = options[i];
			if (values[i] != value) {
				values[i] = value;
				if (target && (names === true || names.indexOf(i) >= 0)) {
					target[i] = values[i];
				}
			}
		}

		this.invokeEvents();

		return this;
	},

	/** @private */
	prepareOptions: function (options, value) {
		if (typeof options == 'string') {
			var i = options;
			options = {};
			options[i] = value;
		} else if (options instanceof this.constructor) {
			options = options.values;
		}
		return options;
	},

	/**
	 * @param {String} name
	 * @return atom.Options
	 */
	unset: function (name) {
		delete this.values[name];
		return this;
	},

	/** @private */
	invokeEvents: function () {
		if (!this.events) return this;

		var values = this.values, name, option;
		for (name in values) if (values.hasOwnProperty(name)) {
			option = values[name];
			if (this.isInvokable(name, option)) {
				this.events.add(name, option);
				this.unset(name);
			}
		}
		return this;
	},

	/** @private */
	isInvokable: function (name, option) {
		return name &&
			option &&
			coreIsFunction(option) &&
			(/^on[A-Z]/).test(name);
	}
});

var Settings = atom.Settings;