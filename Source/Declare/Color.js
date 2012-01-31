/*
---

name: "Color"

description: "Provides Color class"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom
	- declare
	- Types.Number
	- Types.Array

provides: Color

...
*/


declare( 'atom.Color',
/** @class atom.Color */
{
	own: {
		invoke: declare.castArguments,

		/**
		 * Checks if string is color description
		 * @param {string} string
		 * @returns {boolean}
		 */
		isColorString : function (string) {
			if (typeof string != 'string') return false;
			return string in this.colorNames ||
				string.match(/^#\w{3,6}$/) ||
				string.match(/^rgba?\([\d, ]+\)$/);
		},

		colorNames: {
			white:  '#ffffff',
			silver: '#c0c0c0',
			gray:   '#808080',
			black:  '#000000',
			red:    '#ff0000',
			maroon: '#800000',
			yellow: '#ffff00',
			olive:  '#808000',
			lime:   '#00ff00',
			green:  '#008000',
			aqua:   '#00ffff',
			teal:   '#008080',
			blue:   '#0000ff',
			navy:   '#000080',
			fuchsia:'#ff00ff',
			purple: '#800080',
			orange: '#ffa500'
		},

		/**
		 * @param {boolean} [html=false] - only html color names
		 * @returns {atom.Color}
		 */
		random: function (html) {
			var random = atom.number.random;
			if (html) {
				return new this(atom.array.random(
					Object.keys(this.colorNames)
				));
			} else {
				return new this([
					random(0, 255),
					random(0, 255),
					random(0, 255)
				]);
			}
		}
	},

	prototype: {
		initialize: function (value) {
			var a = arguments, type;
			if (a.length == 4 || a.length == 3) {
				value = slice.call(a);
			} else if (value && value.length == 1) {
				value = value[0];
			}

			type = typeof value;
			if (Array.isArray(value)) {
				this.fromArray(value);
			} else if (type == 'number') {
				this.fromNumber(value);
			} else if (type == 'string') {
				this.fromString(value);
			} else if (type == 'object') {
				this.fromObject(value);
			} else {
				throw new TypeError('Unknown type in atom.Color: ' + typeof value + ';\n' + value);
			}
		},

		/** @private */
		r: 0,
		/** @private */
		g: 0,
		/** @private */
		b: 0,
		/** @private */
		a: 1,

		/**
		 * We are array-like object (looks at accessors at bottom of class)
		 * @constant
		 */
		length: 4,

		get red   () { return this.r },
		get green () { return this.g },
		get blue  () { return this.b },
		get alpha () { return this.a },

		set red   (v) { this.setValue('r', v) },
		set green (v) { this.setValue('g', v) },
		set blue  (v) { this.setValue('b', v) },
		set alpha (v) { this.setValue('a', v, true) },

		/** @private */
		safeAlphaSet: function (v) {
			if (v != null) this.alpha = v;
		},

		/** @private */
		setValue: function (prop, value, isFloat) {
			value = Number(value);
			if (value != value) { // isNaN
				throw new TypeError('Value is NaN (' + prop + '): ' + value);
			}

			if (!isFloat) value = Math.round(value);
			// We don't want application down, if user script (e.g. animation)
			// generates such wrong array: [150, 125, -1]
			this[prop] = atom.number.limit( value, 0, isFloat ? 1 : 255 );
		},

		// Parsing

		/**
		 * @param {int[]} array
		 * @returns {atom.Color}
		 */
		fromArray: function (array) {
			if (!array || array.length < 3 || array.length > 4) {
				throw new TypeError('Wrong array in atom.Color: ' + array);
			}
			this.red   = array[0];
			this.green = array[1];
			this.blue  = array[2];
			this.safeAlphaSet(array[3]);
			return this;
		},
		/**
		 * @param {Object} object
		 * @param {number} object.red
		 * @param {number} object.green
		 * @param {number} object.blue
		 * @returns {atom.Color}
		 */
		fromObject: function (object) {
			if (typeof object != 'object') {
				throw new TypeError( 'Not object in "fromObject": ' + typeof object );
			}

			function fetch (p1, p2) {
				return object[p1] != null ? object[p1] : object[p2]
			}

			this.red   = fetch('r', 'red'  );
			this.green = fetch('g', 'green');
			this.blue  = fetch('b', 'blue' );
			this.safeAlphaSet(fetch('a', 'alpha'));
			return this;
		},
		/**
		 * @param {string} string
		 * @returns {atom.Color}
		 */
		fromString: function (string) {
			if (!this.constructor.isColorString(string)) {
				throw new TypeError( 'Not color string in "fromString": ' + string );
			}

			var hex, array;

			string = string.toLowerCase();
			string = this.constructor.colorNames[string] || string;
			
			if (hex = string.match(/^#(\w{1,2})(\w{1,2})(\w{1,2})$/)) {
				array = hex.slice(1).map(function (part) {
					if (part.length == 1) part += part;
					return parseInt(part, 16);
				});
			} else {
				array = string.match(/([\.\d]{1,3})/g).map( Number );
			}
			return this.fromArray(array);
		},
		/**
		 * @param {number} number
		 * @returns {atom.Color}
		 */
		fromNumber: function (number) {
			if (typeof number != 'number' || number < 0 || number > 0xffffffff) {
				throw new TypeError( 'Not color number in "fromNumber": ' + number );
			}

			// we can't use bitwize operations because "0xffffffff | 1 == -1"
			
			var string = number.toString(16);

			while (string.length < 8) string = '0' + string;

			return this.fromArray([
				parseInt(string[0] + string[1], 16),
				parseInt(string[2] + string[3], 16),
				parseInt(string[4] + string[5], 16),
				atom.number.round(
					parseInt(string[6] + string[7], 16) / 255
				, 3)
			]);
		},

		// Casting

		/** @returns {int[]} */
		toArray: function () {
			return [this.r, this.g, this.b, this.a];
		},
		/** @returns {string} */
		toString: function (type) {
			var arr = this.toArray();
			if (type == 'hex' || type == 'hexA') {
				return '#' + arr.map(function (color, i) {
					if (i == 3) { // alpha
						if (type == 'hex') return '';
						color = Math.round(color * 255);
					}
					var bit = color.toString(16);
					return bit.length == 1 ? '0' + bit : bit;
				}).join('');
			} else {
				return 'rgba(' + arr + ')';
			}
		},
		/** @returns {number} */
		toNumber: function () {
			// maybe needs optimizations
			return parseInt( this.toString('hexA').substr(1) , 16)
		},
		/** @returns {object} */
		toObject: function (abbreviationNames) {
			return atom.array.associate( this.toArray(),
				abbreviationNames ?
					['r'  , 'g'    , 'b'   ,'a'    ] :
					['red', 'green', 'blue','alpha']
			);
		},

		// manipulations

		/**
		 * @param {atom.Color} color
		 * @returns {atom.Color}
		 */
		diff: function (color) {
			color = this.constructor( arguments );
			return new this.constructor([
				color.red   - this.red  ,
				color.green - this.green,
				color.blue  - this.blue ,
				color.alpha - this.alpha
			]);
		},
		/**
		 * @param {atom.Color} color
		 * @returns {atom.Color}
		 */
		move: function (color) {
			color = this.constructor(arguments);
			this.red   += color.red  ;
			this.green += color.green;
			this.blue  += color.blue ;
			this.alpha += clone.alpha;
			return this;
		},
		/** @deprecated - use `clone`+`move` instead */
		shift: function (color) {
			color = this.constructor(arguments);

			return this.clone().move(color);
		},

		/** @private */
		dump: function () {
			return '[atom.Color(' + this.toString('hexA') + ')]';
		},

		/**
		 * @returns {atom.Color}
		 */
		clone: function () {
			return new this.constructor(this);
		}
	}
});
['red', 'green', 'blue', 'alpha'].forEach(function (color, index) {
	atom.accessors.define( atom.Color.prototype, index, {
		get: function () {
			return this[color];
		},
		set: function (value) {
			this[color] = value;
		}
	});
});