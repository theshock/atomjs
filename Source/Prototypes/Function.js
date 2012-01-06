/*
---

name: "Prototypes.Function"

description: "Contains Function Prototypes like context, periodical and delay."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom
	- Prototypes.Array

provides: Prototypes.Function

...
*/

new function () {

	var getContext = function (bind, self) {
		return (bind === false || bind === Function.context) ? self : bind;
	};

	atom.extend(Function, {
		lambda : function (value) {
			var returnThis = (arguments.length == 0);
			return function () { return returnThis ? this : value; };
		},
		copier: function (value) {
			return function () { return atom.clone(value); }
		},
		log: function (msg) {
			var args = arguments.length ? arguments : null;
			return function () {
				atom.log.apply(atom, args || [this]);
			};
		},
		// for pointing at "this" context in "context" method
		context: {}
	});

	atom.implement(Function, {
		after: function (fnName) {
			var onReady = this, after = {}, ready = {};
			var checkReady = function () {
				for (var i in after) if (!(i in ready)) return;
				onReady(ready);
			};
			for (var i = 0, l = arguments.length; i < l; i++) {
				(function (key) {
					after[key] = function () {
						ready[key] = arguments;
						checkReady();
					};
				})(arguments[i]);
			}
			return after;
		}
	});

	var timeout = function (name) {
		var set = {
			Timeout : setTimeout,
			Interval: setInterval
		}[name];

		return function (time, bind, args) {
			return set.call(atom.global, this.bind.apply(this, [bind].append(args)), time);
		};
	};
	
	atom.implement(Function, {
		delay:      timeout('Timeout'),
		periodical: timeout('Interval')
	});
}(); 
