/*
---

name: "Dom"

description: "todo"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom

provides: cookie

...
*/

atom.extend({
	cookie: {
		get: function (name) {
			var matches = document.cookie.match(new RegExp(
			  "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
			));
			return matches ? decodeURIComponent(matches[1]) : null;
		},
		set: function (name, value, props) {
			props = props || {};
			var exp = props.expires;
			if (exp) {
				if (exp.toUTCString) {
					exp = exp.toUTCString();
				} else if (typeof exp == 'number') {
					exp = exp * 1000 * Date.now();
				}
				props.expires = exp;
			}

			var cookie = [name + "=" + encodeURIComponent(value)];
			for (var propName in props) cookie.push(
				props[propName] === true ? propName :
					propName + "=" + props[propName]
			);
			document.cookie = cookie.join('; ');

			return this;
		},
		del: function (name) {
			return atom.cookie.set(name, null, { expires: -1 });
		}
	}
});