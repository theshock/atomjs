/*
---

name: "Boolean"

description: "Contains Boolean Prototypes like xor."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom

provides: Boolean

...
*/

atom.extend(Boolean, {
	xor: function (a, b) {
		return !a != !b;
	}
});

atom.implement(Boolean, {
	xor: function (x) {
		return Boolean.xor( this.valueOf(), x );
	}
});