Atom
====

Atom is compact JavaScript framework oriented on modern browsers, which allows
to support quite broad list of features without keeping a lot of cruft necessary
to implement them in old browsers.

Supported browsers:

* Firefox 3.5+
* Google Chrome
* Safari 4+ (maybe earlier?)
* Opera 10+ (maybe earlier?)
* Mobile Safari
* Android Browser

Distributed under terms of LGPL.

Documentation: see lower for description of Atom core and bundled plugins, or
read documentation about [creating a plugin](/theshock/atomjs/blob/master/plugins.md).

Atom Core
=========

#### atom.extend(object, safe = false)

Extend Atom instance with properties (accessible only from main Atom instance)

Optional parameter `safe` means that only unimplemented properties should be
included.

#### atom.implement(object, safe = false)

Extend Atom prototype with properties (accessible in every Atom instance)

#### atom.extend(object, safe = false, parent)

Extend `object` with `parent` properties

	config = atom.extend({
		// default values for config
		a : 15,
		b : 20
	}, config);

#### atom.implement(object, safe = false, parent)

Extend `object.prototype` with `parent` properties.

	nano.implement(child, parent);

	// extend Function with .bind property if not implemented yet
	nano.implement(Function, true, { bind : function () { /* code */} });

#### atom.toArray(arrayLikeObject)

Cast `arrayLikeObject` to `Array`

	var args = atom.toArray(arguments);

#### atom.log(arg1, [arg2, ...])

Safe alias for `console.log`

#### atom.isAtom(object)

Checks if `object` is Atom instance

	atom.isAtom(atom()); // true


JavaScript 1.8.5 Compatiblity
-----------------------------

Browsers, which do not have JavaScript 1.8.5 compatibility, will get those
methods implemented:

* [Function.prototype.bind](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind)
* [Object.keys](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys)
* [Array.isArray](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray)


Atom.Plugins.DOM
================

#### Constructor:

	atom();
	atom('tag .class');
	atom({tag: 'tag'});
	atom({id: 'id'});
	atom({Class: 'class'});
	atom(document.getElementsByTagName('tag'));
	atom(selector, context);

#### onready

	atom(function () {
		// DOMContentLoaded
	});
	atom().ready(true, function () {
		// document.onload
	});

#### atom().body

	var body = atom().body;

#### atom().get(index = 0)

Returns html-element from current collection

	atom('img').get();  // first image on a page
	atom('img').get(5); // fifth image on a page

#### atom().create(tagName, index = 0, attrs = null)

Creates element, adds it to node and returns it

Optional arguments:

* `index` - index of node in current collection
* `attrs` - properties to set on new element

	// creating Canvas in fifth div:
	var atomCanvas = atom('div').create('canvas', 5);

	// creating Canvas with properties
	var atomCanvas = atom('div').create('canvas', {
		width  : 400,
		height : 100
	});

#### atom().each(fn)

Apply function on each element of collection (analogue of `Array.forEach`):

	atom('div').each(function (div, index) {
		div.className = 'active';
		// this == atom('div')
	});

#### atom().css(properties)

Apply CSS to every element:

	// let's paint every div in red
	atom('div').css('background', 'red');
	atom('div').css({background: 'red'});

#### atom().bind(events)

Attach event handler to every element in current collection

	atom('div').bind({click: function () {
		alert('div clicked')
	}});

#### atom().delegate(selector, event, fn)

Attach event handler to every matching element in current collection now and in
future.

	atom('div').delegate('img', 'click', function () {
		alert('img clicked')
	}});

#### atom().find(selector)

Find element inside current collection. Equivalent to atom(selector, context);

	atom('div').find('p') == atom('div p');

#### atom().appendTo(elem)

Append collection to another element

	atom('img').appendTo('div'); // append every image to div

#### atom().attr(values)

Set attribute for every element in current collection

	atom('canvas').attr({
		width  : 50,
		height : 50
	});

#### atom().destroy()

Destroy current collection

	atom('div').destroy();


Atom.Plugins.Types.Number
=========================

#### Number.between(n1, n2, equals)

	(5).between(2, 6); // true
	(6).between(2, 6); // false
	(6).between(2, 6, true); // true

#### Number.equals(to, accuracy = 8)

Allows to compare two float numbers (which can't be done with `==`) with
`accuracy` digits after dot

	(1.15124124).equals(1.15124124); // true
	(1.15124124).equals(1.15124001); // false
	(1.15124124).equals(1.15124001, 3); // true (1.151 == 1.151)


Atom.Plugins.Types.Array
========================

#### Array.contains(elem)

Checks if `elem` is present in `Array`

	[1,2,3].contains(1); // true


Atom.Plugins.Class
==================

Support for traditional class-based OOP

	var NameLogger = atom.Class({
		log : function (msg) {
			atom.log(this.name, msg);
			return this;
		}
	});

	var AnimalFactory = atom
		.Factory({
			constructor : function (name) {
				this.name = name;
				this.log('Animal.constructor');
			},
			walk : function () {
				this.log('Animal.walk');
			}
		})
		.extend({
			staticProperty : '!~static-prop~!'
		})
		.mixin(NameLogger);

	var Animal = AnimalFactory.get();
	// Animal.factory == AnimalFactory

	var Dog = atom
		.Class(AnimalFactory, {
			constructor : function (name, breed) {
				this.parent(name);
				this.breed = breed;
				this.log('Dog.constructor');
			},
			bark : function () {
				return this.log('Dog.bark');
			},
			getStatic : function () {
				this.log(this.self.staticProperty);
			}
		});

	var dog = new Dog('Box', 'shepherd');
	dog.bark();
	dog.walk();
	atom.log(dog instanceof Animal); // true
	atom.log(dog instanceof Dog);

	// Factory method:
	var cat = AnimalFactory.produce(['Tom']);
	var dog = Dog.factory.produce(['Max', 'dalmatian']);


Atom.Plugins.Ajax
=================

	atom.ajax(config);

Config parameters:

* `interval`: 0. Repeat every `interval` seconds if it's greater than 0
* `type`: `'plain'`. One of `'plain'` or `'json'` (response automatically parsed as JSON)
* `method`: `'post'`. One of `'post'`, `'get'`, `'put'`, `'delete'`
* `url`: `location.href`. Request url
* `callbacks`. One of `'onLoad'`, `'onError'`

Example:

	atom.ajax({
		type   : 'json',
		method : 'get',
		url    : 'test.php',
		onLoad : function (json) {
			atom.log(json);
		},
		onError: function () {
			atom.log('error');
		}
	});

### Atom.Plugins.Ajax + Atom.Plugins.Dom

	atom('#newMsgs').ajax({ // update html of #newMsgs
		interval : 15, // every 15 seconds
		url : 'newMsgs.php'
	});
