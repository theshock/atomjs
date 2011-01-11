/*
---

name: "Ajax.Dom"

description: todo

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires: [atom, atom.dom, atom.ajax]

provides: [atom.ajax.dom]

...
*/

atom.implement({
	ajax : function (config) {
		config = atom.extend({
			onload: function (res) {
				this.get().innerHTML = res;
			},
			onerror: function(){}
		}, config);


		atom.ajax(atom.extend(config, {
			onError: config.onError.bind(this),
			onLoad : config.onLoad .bind(this)			
		}));
		return this;
	}
});
