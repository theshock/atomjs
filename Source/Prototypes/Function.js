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

	Function.lambda = function (value) {
		var returnThis = (arguments.length == 0);
		return function () { return returnThis ? this : value; };
	};

	var timeout = function (periodical) {
		var set = periodical ? setInterval : setTimeout;

		return function (time, bind, args) {
			var fn = this;
			return set(function () {
				fn.apply( bind, args || [] );
			}, time);
		};
	};
	
	atom.implement(Function, {
		after: function (fnName) {
			var onReady = this, after = {}, ready = {};
			var checkReady = function () {
				for (var i in after) if (!(i in ready)) return;
				onReady(ready);
			};
			slice.call(arguments).forEach(function (key) {
				after[key] = function () {
					ready[key] = arguments;
					checkReady();
				};
			});
			return after;
		},
		delay:      timeout(false),
		periodical: timeout(true )
	});

}(); 
