/*
---

name: "[AtomJS Plugin] Array"

description: "Contains Array Prototypes like include, contains, and erase."

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires: [atom]

provides: [Array]

...
*/

atom.extend(Array, 'safe', {
	range: function (from, to, step) {
		step = (step * 1).limit(0) || 1;
		var result = [];
		do {
			result.push(from);
			from += step;
		} while (from <= to);
		return result;
	},
	pickFrom: function (args) {
		return args
			&& args.length == 1
			&& ['array', 'arguments'].contains(atom.typeOf(args[0])) ?
				args[0] : atom.toArray(args);
	},
	fill: function (array, fill) {
		var array = Array.isArray(array) ? array : new Array(1 * array);
		for (var i = array.length; i--;) array[i] = fill;
		return array;
	},
	collect: function (obj, props, Default) {
		var array = [];
		for (var i in props.toKeys()) array.push(i in obj ? obj[i] : Default);
		return array;
	},
	toHash: function () {
		for (var hash = {}, i = 0, l = this.length; i < l; i++) hash[i] = this[i];
		return hash;
	}
});

atom.implement(Array, 'safe', {
	contains: function (elem) {
		return this.indexOf(elem) != -1;
	},
	include: function(item){
		if (!this.contains(item)) this.push(item);
		return this;
	},
	append: function (array) {
		for (var i = 0, l = arguments.length; i < l; i++) {
			this.push.apply(this, arguments[i]);
		}
		return this;
	},
	erase: function(item){
		for (var i = this.length; i--;) if (this[i] === item) this.splice(i, 1);
		return this;
	},
	toKeys: function (value) {
		var useValue = arguments.length == 1, obj = {};
		for (var i = 0, l = this.length; i < l; i++)
			obj[this[i]] = useValue ? value : i;
		return obj;
	},
	combine: function(array){
		for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
		return this;
	},
	last: function(){
		return this.length ? this[this.length - 1] : null;
	},
	random: function(){
		return this.length ? this[Number.random(0, this.length - 1)] : null;
	},
	pick: function(){
		for (var i = 0, l = this.length; i < l; i++){
			if (this[i] || this[i] === 0) return this[i];
		}
		return null;
	},
	invoke: function(context){
		var args = [].slice.call(arguments, 1);
		if (typeof context == 'string') {
			var methodName = context;
			context = null;
		}
		return this.map(function(item){
			return item && (methodName ? item[methodName] : item).apply(methodName ? item : context, args);
		});
	},
	shuffle : function () {
		for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
		return this;
	},
	sortBy : function (method, reverse) {
		var get = function (elem) {
			return typeof elem[method] == 'function' ? elem[method]() : (elem[method] || 0);
		};
		var multi = reverse ? -1 : 1;
		return this.sort(function ($0, $1) {
			var diff = get($1) - get($0);
			return diff ? (diff < 0 ? -1 : 1) * multi : 0;
		});
	},
	min: function(){
		return Math.min.apply(null, this);
	},
	max: function(){
		return Math.max.apply(null, this);
	},
	average: function(){
		return this.length ? this.sum() / this.length : 0;
	},
	sum: function(){
		for (var result = 0, i = this.length; i--;) result += this[i];
		return result;
	},
	unique: function(){
		return [].combine(this);
	},
	associate: function(keys){
		var obj = {}, length = Math.min(this.length, keys.length);
		for (var i = 0; i < length; i++) obj[keys[i]] = this[i];
		return obj;
	},
	clean: function (){
		return this.filter(function (item) { return !!item; });
	},
	empty: function () {
		this.length = 0;
		return this;
	},
	clone: function () {
		return atom.clone(this);
	},
	hexToRgb: function(){
		if (this.length != 3) return null;
		return this.map(function(value){
			if (value.length == 1) value += value;
			return value.toInt(16);
		});
	},
	rgbToHex: function(){
		if (this.length < 3) return null;
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (this[i] - 0).toString(16);
			hex.push(bit.length == 1 ? '0' + bit : bit);
		}
		return hex;
	}
});