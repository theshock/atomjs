/*
---

name: "AtomJS"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

inspiration:
	- "[JQuery](http://jquery.com)"
	- "[MooTools](http://mootools.net)"

...
*/

(function (Object, Array, undefined) { // AtomJS
'use strict';

var
	prototype = 'prototype',
	toString  = Object[prototype].toString,
	slice     = [].slice;

var atom = this.atom = function () {
	if (atom.initialize) return atom.initialize.apply(this, arguments);
};

atom.global = this;

/*** [Code] ***/

}.call(typeof exports == 'undefined' ? window : exports, Object, Array));