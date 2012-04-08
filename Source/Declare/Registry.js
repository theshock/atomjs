/*
---

name: "Registry"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- declare

provides: Registry

...
*/

/** @name atom.Registry */
var Registry = declare( 'atom.Registry', {
	initialize: function (initial) {
		this.items = {};
		if (initial) this.set(initial);
	},
	set: atom.core.overloadSetter(function (name, value) {
		this.items[name] = value;
	}),
	get: atom.core.overloadGetter(function (name) {
		return this.items[name];
	})
});