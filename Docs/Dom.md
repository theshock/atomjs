Atom.Plugins.DOM
================

#### Constructor:

	atom.dom();
	atom.dom('tag .class');
	atom.dom(document.getElementsByTagName('tag'));
	atom.dom(selector, context);

#### onready

	atom.dom(function () {
		// DOMContentLoaded
	});

#### atom.dom().body

	var body = atom.dom().body;

#### atom.dom().get(index = 0)

Returns html-element from current collection

	atom.dom('img').first;  // first image on a page
	atom.dom('img').get();  // first image on a page
	atom.dom('img').get(5); // fifth image on a page

#### atom.dom().create(tagName, index = 0, attrs = null)

Creates element, adds it to node and returns it

Optional arguments:

* `index` - index of node in current collection
* `attrs` - properties to set on new element

Example:

	// creating Canvas in fifth div:
	var atomCanvas = atom.dom('div').create('canvas', 5);

	// creating Canvas with properties
	var atomCanvas = atom.dom('div').create('canvas', {
		width  : 400,
		height : 100
	});

#### atom.dom().each(fn)

Apply function on each element of collection (analogue of `Array.forEach`):

	atom.dom('div').each(function (div, index) {
		div.className = 'active';
		// this == atom.dom('div')
	});

#### atom.dom().css(properties)

Apply CSS to every element:

	// let's paint every div in red
	atom.dom('div').css('background', 'red');
	atom.dom('div').css({background: 'red'});

#### atom.dom().bind(events)

Attach event handler to every element in current collection

	atom.dom('div').bind({click: function () {
		alert('div clicked')
	}});

#### atom.dom().delegate(selector, event, fn)

Attach event handler to every matching element in current collection now and in
future.

	atom.dom('div').delegate('img', 'click', function () {
		alert('img in div clicked')
	}});

#### atom.dom().find(selector)

Find element inside current collection. Equivalent to atom(selector, context);

	atom.dom('div').find('p') == atom.dom('div p');

#### atom.dom().appendTo(elem)

Append collection to another element

	atom.dom('img').appendTo('div'); // append every image to div

#### atom.dom().attr(values)

Set attribute for every element in current collection

	atom.dom('canvas').attr({
		width  : 50,
		height : 50
	});

#### atom.dom().destroy()

Destroy current collection

	atom.dom('div').destroy();

#### atom.dom().filter(selector)

Filter elements according to selector

	// returns only divs with class "className"
	atom.dom('div').filter('.className');


#### atom.dom().is(selector)

Checks if elems is matched to selector

	// returns true is there are divs with class "className"
	atom.dom('div').is('.className');

#### atom.dom().html(value = undefined)

get or set html of first element in set

	atom.dom('div').html('abc');
	atom.dom('div').html(); // 'abc'

#### atom.dom().wrap(wrapper)

Wrap first element of set with wrapper

	atom.dom('span').wrap( atom.dom().create('div') );

#### atom.dom().replaceWith(newElement)

Replace first element of the set with newElement

	atom.dom('span').replaceWith( atom.dom().create('div') );

#### atom.dom().addClass(className)

Adds new class "className" to all elements of set

	atom.dom('span').addClass('foo');


#### atom.dom().removeClass(className)

Removes class "className" from all elements of set

	atom.dom('span').removeClass('foo');


#### atom.dom().toggleClass(className)

Toggles class "className" for all elements of set

	atom.dom('span').toggleClass('foo');


#### atom.dom().hasClass(className)

Returns true if set contains one or more elements
having class "className"

	atom.dom('span').hasClass('foo');
