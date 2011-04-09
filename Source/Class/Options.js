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

		if (arguments.length) {
			var args = [{}, this.options].append(arguments);
			// FIX: не нужно каждый раз создавать новый объект, необходимо перезаписывать старый
			this.options = atom.merge.apply(null, args);
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