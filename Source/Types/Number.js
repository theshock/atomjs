/*
---

name: "Types.Number"

description: "Contains number-manipulation methods like limit, round, times, and ceil."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom

provides: Types.Number

...
*/

atom.number = {
	random : function (min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	},
	between: function (number, n1, n2, equals) {
		number = Number(number);
		n1 = Number(n1);
		n2 = Number(n2);
		return (n1 <= n2) && (
			(equals == 'L' && number == n1) ||
			(equals == 'R' && number == n2) ||
			(number  > n1  && number  < n2) ||
			([true,'LR','RL'].indexOf(equals) != -1 && (n1 == number || n2 == number))
		);
	},
	equals : function (number, to, accuracy) {
		if (accuracy == null) accuracy = 8;
		return number.toFixed(accuracy) == to.toFixed(accuracy);
	},
	limit: function(number, min, max){
		var bottom = Math.max(min, Number(number));
		return max != null ? Math.min(max, bottom) : bottom;
	},
	round: function(number, precision){
		precision = Number( Math.pow(10, precision || 0).toFixed(precision < 0 ? -precision : 0) );
		return Math.round(number * precision) / precision;
	},
	stop: function(num) {
		num = Number(num);
		if (num) {
			clearInterval(num);
			clearTimeout (num);
		}
		return this;
	}
};