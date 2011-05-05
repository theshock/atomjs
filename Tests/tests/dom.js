new function () {

module('[Atom Plugins] Dom');

test('Get', function(){
	var ID = 'qunit-fixture', $ID = '#' + ID,
		win = window, doc = win.document,
		wrapper = doc.getElementById(ID);


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
	var ID = 'qunit-fixture', $ID = '#' + ID,
		win = window, doc = win.document,
		wrapper = doc.getElementById(ID);

	var returnSetAttribute = function() {
		atom($ID + 'code').attr('data-test-attr', '1');
		return atom($ID + 'code').attr('data-test-attr') == 1;
	};

	strictEqual(atom($ID + 'code').attr('style'), wrapper.getElementsByTagName('code')[0].getAttribute('style'), 'atom.dom("#cid code").attr("style") right attribute content');
	strictEqual(returnSetAttribute, true , 'atom.dom("#cid code").attr("data-test-attr", "1") attribute must equal to 1');
});

test('atom.css', function() {
	var ID = 'qunit-fixture', $ID = '#' + ID,
		win = window, doc = win.document,
		wrapper = doc.getElementById(ID);

	var returnSetCssStyle = function() {
		atom($ID + 'code').css('color', '#888');
		return atom($ID + 'code').css('color') == '#888';
	};

	var returnSetArrayCssStyle = function() {
		atom($ID + 'code').css({
			color: '#777',
			backgroundColor: '#333'
		});
		return atom($ID + 'code').css('color') == '#777' && atom($ID + 'code').css('backgroundColor') == '#333';
	};

	strictEqual(atom($ID + 'code').css('color'), '#999', 'inline style "color" of atom.dom("#cid code") must equal to "#999"');
	strictEqual(atom($ID + 'code').css('position'), 'absolute', 'css style "position" of atom.dom("#cid code") must equal to "absolute"');
	strictEqual(returnSetCssStyle, true, 'set the css style "color" of atom.dom("#cid code") should be equal to "#888"');
	strictEqual(returnSetArrayCssStyle, true, 'set the array of css styles ("color" and "backgroundColor") of atom.dom("#cid code") should be equal to "#777" and "#333" respectively');
});

};