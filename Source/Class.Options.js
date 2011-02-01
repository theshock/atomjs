/*
---

name: "Class.Options"

description: ""

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom
	- atom.Class

inspiration:
  - "[MooTools](http://mootools.net)"

provides: atom.Class.Options

...
*/

atom.extend(atom.Class, {
	Options: atom.Class({
		setOptions: function(){
			var options = this.options = atom.merge.apply(null, [{}, this.options].append(arguments));
			console.log(this.options, [{}, this.options].append(arguments));
			return this;
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