/*
---

name: "Class.Options"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

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

		for (var a = arguments, i = 0, l = a.length; i < l; i++) {
			if (typeof a[i] == 'object') atom.extend(this.options, a[i]);
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