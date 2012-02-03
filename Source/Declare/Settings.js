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

var Settings = declare( 'atom.Settings',
{
	/** @private */
	recursive: false,

	/** @private */
	values: {},

	/**
	 * @constructs
	 * @param {Object} [initialValues]
	 * @param {Boolean} [recursive=false]
	 */
	initialize: function (initialValues, recursive) {
		if (!this.isValidOptions(initialValues)) {
			recursive = !!initialValues;
			initialValues = null;
		}

		this.values    = initialValues || {};
		this.recursive = !!recursive;
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
	 * @param {String} name
	 */
	get: function (name) {
		return this.values[name];
	},

	/**
	 * @param {Object} options
	 * @return atom.Options
	 */
	set: function (options) {
		var method = this.recursive ? 'extend' : 'append';
		if (this.isValidOptions(options)) {
			atom.core[method](this.values, options);
		}
		this.invokeEvents();
		return this;
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
	isValidOptions: function (options) {
		return options && typeof options == 'object';
	},

	/** @private */
	invokeEvents: function () {
		if (!this.events) return this;

		var values = this.values, name, option;
		for (name in values) {
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