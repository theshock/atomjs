new function () {

var ID = 'qunit-fixture', $ID = '#' + ID,
	win = window, doc = win.document,
	wrapper = doc.getElementById(ID);

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

	var returnSetAttribute = function() {

		return atom.dom($ID + 'code').attr('data-test-attr') == 1;
	};

	strictEqual($elem.attr('style'), wrapper.getElementsByTagName('code')[0].getAttribute('style'), 'atom.dom("#cid code").attr("style") right attribute content');
	$elem.attr('data-test-attr', 42);
	equal($elem.attr('data-test-attr'), 42, 'atom.dom("#cid code").attr("data-test-attr", "42") attribute must equal to 42');
});

test('atom.css', function() {
	var $elem = atom.dom($ID + ' code');

	strictEqual($elem.css('color'), '#999', 'inline style "color" of atom.dom("#cid code") must equal to "#999"');
	strictEqual($elem.css('position'), 'absolute', 'css style "position" of atom.dom("#cid code") must equal to "absolute"');

	$elem.css('color', '#888');
	strictEqual($elem.css('color'), '#888', 'set the css style "color" of atom.dom("#cid code") should be equal to "#888"');

	$elem.css({
		color: '#777',
		backgroundColor: '#333'
	});
	strictEqual($elem.css('color'), '#777', 'set the array of css styles ("color") of atom.dom("#cid code") should be equal to "#777"');
	strictEqual($elem.css('backgroundColor'), '#333', 'set the array of css styles ("backgroundColor") of atom.dom("#cid code") should be equal to "#333"');
});

};