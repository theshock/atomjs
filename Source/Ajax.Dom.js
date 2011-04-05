/*
---

name: "Ajax.Dom"

description: todo

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom
	- dom
	- ajax

provides: ajax.dom

...
*/

atom.implement(atom.dom, {
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
