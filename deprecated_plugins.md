How to create a plugin
======================

That's actually how Ajax plugin is implemented. It's quite simple and you can
learn everything you need to know about plugins from its implementation.

    (function () {
        // Adding information about ourselvels to plugin list.
        // Instead of true we could supply plugin version here
        atom.plugins['ajax'] = true;

        // this will be atom.ajax(config)
        var ajax = function (userConfig) {
            // default options
            var config = atom.extend({
                interval : 0,
                type     : 'plain',
                method   : 'post',
                url      : location.href,
                onLoad   : function(){},
                onError  : function(){}
            }, userConfig);

            // no support for old browsers ;-)
            var req = new XMLHttpRequest();
            req.onreadystatechange = ajax.onready;
            req.open(config.method.toUpperCase(), config.url, true);
            req.send(null);
        };

        // use small methods to allow easy customization of behavior
        ajax.onready = function (e) {
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
            };
        };

        // adding method to Atom
        atom.extend({ ajax : ajax });
    })();

Now we want to have a support for using Ajax with DOM plugin:

    // that's from previous piece of code, so you can understand where we're
    // adding that stuff :)
    atom.extend({ ajax : ajax });

    // only if plugin 'dom' is present
    if (atom.plugins['dom']) {
        // extending prototype this time
        atom.implement({
            ajax : function (config) {
                config = extend({}, config);

                // please note that callback, passed by user, will be called
                // in atom() element context
                atom.ajax(extend(config, {
                    // use user supplied callback or just update element contents
                    onLoad  : (config.onLoad || function (res) {
                        this.get().innerHTML = res;
                    }).bind(this),
                    onError : (config.onError || function(){}).bind(this)
                }));
                return this;
            }
        });
    }
