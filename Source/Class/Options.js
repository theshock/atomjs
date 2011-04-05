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
			if (!this.options) this.options = {};

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