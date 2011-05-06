new function () {

var ID = 'qunit-fixture', $ID = '#' + ID,
	win = window, doc = win.document,
	wrapper = doc.getElementById(ID), slice=[].slice;

module('[Atom Plugins] Dom');

test('Get', function(){
	strictEqual(atom.dom().get(), doc, 'atom.dom() is document');
	strictEqual(atom.dom('unknownTag').length, 0, 'atom.dom("unknownTag") returns nothing');
	strictEqual(atom.dom($ID + ' p').length , wrapper.getElementsByTagName('p').length    , 'atom.dom("#cid p") right length');
	strictEqual(atom.dom('.foo', $ID).length, wrapper.getElementsByClassName('foo').length, 'atom.dom(".foo", "#cid") right length');
	strictEqual(atom.dom($ID).first, wrapper, 'atom.dom($ID).first');
	strictEqual(atom.dom(atom.dom($ID)).first, wrapper, 'atom.dom(atom.dom($ID)).first');
	deepEqual(atom.dom('#element_is_null').elems, [], 'if no element should be empty');
	// todo: [qtest] full of DOM plugin
});

asyncTest('onDomReady', 1, function () {
	atom.dom(function () {
		ok('onready runned');
	});

	setTimeout(function () {
		// it has 1 sec for onDomReady
		start();
	}, 1000);
});

test('atom.attr', function() {
	var $elem = atom.dom($ID + ' code');

	strictEqual($elem.attr('style'), wrapper.getElementsByTagName('code')[0].getAttribute('style'), 'atom.dom("#cid code").attr("style") right attribute content');
	$elem.attr('data-test-attr', 42);
	equal($elem.attr('data-test-attr'), 42, 'atom.dom("#cid code").attr("data-test-attr", "42") attribute must equal to 42');
});

test('atom.css', function() {
	var $elem = atom.dom($ID + ' code');


	strictEqual($elem.css('color'), 'rgb(150, 150, 150)', 'inline style "color" of atom.dom("#cid code") must equal to "rgb(150, 150, 150)"');
	strictEqual(atom.dom($ID).css('position'), 'absolute', 'css style "position" of atom.dom("#cid") must equal to "absolute"');

	$elem.css('color', 'rgb(100, 100, 100)');
	strictEqual($elem.css('color'), 'rgb(100, 100, 100)', 'set the css style "color" of atom.dom("#cid code") should be equal to "rgb(100, 100, 100)"');

	$elem.css({
		color: 'rgb(80, 80, 80)',
		backgroundColor: 'rgb(30, 30, 30)'
	});
	strictEqual($elem.css('color'), 'rgb(80, 80, 80)', 'set the css style ("color") of atom.dom("#cid code") should be equal to "rgb(80, 80, 80)"');
	strictEqual($elem.css('background-color'), 'rgb(30, 30, 30)', 'set the css style ("backgroundColor") of atom.dom("#cid code") should be equal to "rgb(30, 30, 30)"');
});

test('atom.addClass', function() {
    var $elem = atom.dom($ID + ' p');
    $elem.each(function(e){e.className = ''});

    $elem.addClass('cls1');
    deepEqual(slice.call(wrapper.getElementsByClassName('cls1'), 0), slice.call($elem.elems, 0), 'addClass("cls1") must make elements selectable with getElementsByClassName("cls1")');

    var $elem2 = atom.dom($elem.elems.slice(0,2));
    $elem2.addClass('cls2');
    deepEqual(slice.call(wrapper.getElementsByClassName('cls2'), 0), slice.call($elem2.elems, 0), 'addClass("cls2") must make elements selectable with getElementsByClassName("cls2")');
    deepEqual(slice.call(wrapper.getElementsByClassName('cls1'), 0), slice.call($elem.elems, 0), 'addClass("cls2") must not remove "cls1" from elements');

    var $elem3 = atom.dom($elem.get(0));
    $elem3.addClass(['cls1', 'cls2']);
    var classes = $elem3.get(0).className.split(' ');
    strictEqual(classes.length, 2, 'repeated adding classes must have no effect');

    // cleanup
    $elem.each(function(e){e.className = ''});
});

test('atom.removeClass', function() {
    var $elem = atom.dom($ID + ' p');
    $elem.each(function(e){e.className = 'cls1'});
    var $elem2 = atom.dom($elem.elems.slice(0,2));
    $elem2.each(function(e){e.className = 'cls2 cls1'});

    var $elem3 = atom.dom($elem.get(0));
    $elem3.removeClass('cls1');
    strictEqual($elem3.get(0).className, 'cls2', 'removeClass("cls1") must remove class "cls1" but keep "cls2"');

    $elem.removeClass('cls2');
    strictEqual($elem3.get(0).className, '', 'removeClass("cls2") must remove class "cls2"');
    deepEqual(slice.call(wrapper.getElementsByClassName('cls2'), 0), [], 'removeClass("cls2") must remove class "cls2" from all elements');

    // cleanup
    $elem.each(function(e){e.className = ''});
});

test('atom.hasClass', function() {
    var $elem = atom.dom($ID + ' p');
    $elem.each(function(e){e.className = 'cls1'});

    strictEqual($elem.hasClass('cls1'), true, 'hasClass("cls1") must return true if elements\' className is "cls1"');
    strictEqual($elem.hasClass('cls2'), false, 'hasClass("cls2") must return false if elements\' className is "cls1"');

    var $elem2 = atom.dom($elem.elems.slice(0,2));
    $elem2.each(function(e){e.className='cls2 cls3'});

    strictEqual($elem.hasClass('cls1'), true, 'hasClass(class) must return true if one of the elements has this class');
    strictEqual($elem.hasClass('cls2'), true, 'hasClass(class) must return true if one of the elements has this class');
    strictEqual($elem.hasClass(['cls2','cls3']), true, 'hasClass([classes]) must return true if one of the elements has all the classes');
    strictEqual($elem.hasClass(['cls1','cls3']), false, 'hasClass([classes]) must return false if none of the elements has all the classes');

    // cleanup
    $elem.each(function(e){e.className = ''});
});

test('atom.toggleClass', function() {
    var $elem = atom.dom($ID + ' p');
    $elem.each(function(e){e.className = 'cls1'});
    var $elem2 = atom.dom($elem.elems.slice(0,2));
    $elem2.each(function(e){e.className='cls2 cls3'});

    $elem.toggleClass('cls1');
    deepEqual(slice.call(wrapper.getElementsByClassName('cls1'), 0), slice.call($elem2.elems, 0), 'after toggling "cls1" the only elements having "cls1" must be those which didn\'t have "cls1" before toggling');
    $elem.toggleClass(['cls1','cls2']);
    strictEqual($elem2.hasClass(['cls2','cls3']), false, 'there must not be any element in $elem2 having both "cls2" and "cls3"');
    strictEqual($elem.hasClass(['cls2','cls1']), true, 'there must be some elements in $elem having both "cls2" and "cls1"');

    // cleanup
    $elem.each(function(e){e.className = ''});
});

};
