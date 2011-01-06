/*
---

name: Number

description: Contains Number Prototypes like limit, round, times, and ceil.

license: [GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)

requires: atom

provides: Number

...
*/

atom.extend(Number, 'safe', {
	random : function (min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
});

atom.implement(Number, 'safe', {
	between: function (n1, n2, equals) {
		return (n1 <= n2) && (
			(equals == 'L' && this == n1) ||
			(equals == 'R' && this == n2) ||
			(  this  > n1  && this  < n2) ||
			([true,'LR','RL'].indexOf(equals) != -1 && (n1 == this || n2 == this))
		);
	},
	equals : function (to, accuracy) {
		if (arguments.length == 1) accuracy = 8;
		return this.toFixed(accuracy) == to.toFixed(accuracy);
	},
	limit: function(min, max){
		var bottom = Math.max(min, this);
		return arguments.length == 2 ?
			Math.min(max, bottom) : bottom;
	},
	round: function(precision){
		precision = Math.pow(10, precision || 0).toFixed(precision < 0 ? -precision : 0);
		return Math.round(this * precision) / precision;
	},
	toFloat: function(){
		return parseFloat(this);
	},
	toInt: function(base){
		return parseInt(this, base || 10);
	},
	stop: function() {
		var num = Number(this);
		if (num) {
			clearInterval(num);
			clearTimeout (num);
		}
		return this;
	}
});

new function(math){
	for (var i = math.length; i--;) if (!Number[math[i]]) {
		Number.prototype[math[i]] = function() {
			return Math[math[i]].apply(null, [this].concat(arguments));
		};
	}
}(['abs','acos','asin','atan','atan2','ceil','cos','exp','floor','log','max','min','pow','sin','sqrt','tan']);
