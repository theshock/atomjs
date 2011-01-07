/*
---

name: Function

description: Contains Function Prototypes like context, periodical and delay.

license: [GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)

requires: [atom, Array]

provides: Function

...
*/

new function () {
	atom.extend(Function, 'safe', {
		lambda : function (value) {
			var returnThis = (arguments.length == 0);
			return function () { return returnThis ? this : value; };
		},
		log: function (msg) {
			var args = arguments.length ? arguments : null;
			return function () {
				atom.log.apply(atom, args || [this]);
			};
		}
	});

	atom.implement(Function, 'safe', {
		context: function(bind, args){
			var fn = this;
			args = args ? atom.toArray(args) : [];
			return function(){
				return fn.apply(bind === false ? this : bind, args.append(arguments));
			};
		}
	});

	var timeout = {
		set : {
			Timeout : setTimeout,
			Interval: setInterval
		},
		clear : {
			Timeout : function () { clearTimeout (this); },
			Interval: function () { clearInterval(this); }
		},
		run: function (name, time, bind, args) {
			var result  = timeout.set[name].call(null, this.context(bind, args), time);
			result.stop = timeout.clear[name].context(result);
			return result;
		}
	};
	atom.implement(Function, 'safe', {
		delay:      timeout.run.context(false, ['Timeout']),
		periodical: timeout.run.context(false, ['Interval'])
	});
}(); 
