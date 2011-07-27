/*
---

name: "Function"

description: "Contains Function Prototypes like context, periodical and delay."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom
	- Array

provides: Function

...
*/

new function () {

	var getContext = function (bind, self) {
		return (bind === false || bind === Function.context) ? self : bind;
	};

	var slice = [].slice;

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
		context: function(bind, args){
			var fn = this;
			args = Array.from(args);
			return function(){
				return fn.apply(getContext(bind, this), [].append(args, arguments));
			};
		},
		only: function(numberOfArgs, bind) {
			var fn = this;
			return function() {
				return fn.apply(getContext(bind, this), slice.call(arguments, 0, numberOfArgs))
			};
		}
	});

	var timeout = function (name) {
		var set = {
			Timeout : setTimeout,
			Interval: setInterval
		}[name];

		return function (time, bind, args) {
			return set.call(window, this.context(bind, args), time);
		};
	};
	
	atom.implement(Function, {
		delay:      timeout('Timeout'),
		periodical: timeout('Interval')
	});
}(); 
