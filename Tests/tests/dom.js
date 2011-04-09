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

};