/*
---

name: "Ajax"

description: "todo"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom

provides: ajax

...
*/

(function () {
	var extend = atom.extend, emptyFn = function () { return function(){}; };
	var ajax = function (userConfig) {
		var config     = extend(extend({}, ajax.defaultProps  ), userConfig);
		config.headers = extend(extend({}, ajax.defaultHeaders), userConfig.headers);

		var req = new XMLHttpRequest();
		for (var i in config.headers) req.setRequestHeader(i, config.headers[i]);
		req.onreadystatechange = ajax.onready(req, config);
		req.open(config.method.toUpperCase(), config.url, true);
		req.send(null);
	};

	ajax.defaultProps = {
		interval: 0,
		type    : 'plain',
		method  : 'post',
		url     : location.href,
		onLoad  : emptyFn(),
		onError : emptyFn()
	};

	ajax.defaultHeaders = {
		'X-Requested-With': 'XMLHttpRequest',
		'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
	};
	ajax.onready = function (req, config) {
		return function (e) {
			if (req.readyState == 4) {
				if (req.status != 200) return config.onError(e);

				var result = req.responseText;
				if (config.type.toLowerCase() == 'json') {
					result = JSON.parse(result);
				}
				if (config.interval > 0) setTimeout(function () {
					atom.ajax(config);
				}, config.interval * 1000);
				config.onLoad(result);
			}
		};
	};

	extend({ ajax : ajax });
})();
