
new function () {

/******************************************
 * [Atom Plugins] Types
 ******************************************/

module('[Atom Plugins] Types');

test('Function', function(){
equals(Function.lambda('Foo')(), 'Foo', 'Function.lambda');
equals(function(bar, quz) {
	return this.foo + bar + quz;
}.context({ foo: 'Foo'}, ['Bar'])('Quz'), 'FooBarQuz', 'function.context');

// todo: [qtest] function.delay
// todo: [qtest] function.periodical
});

test('Number', function(){
ok(Number.random(150, 200).between(150, 200, true), 'Number.random in right range');

// between
ok( (50).between(20, 80),       ' (50).between(20, 80)');
ok(!(20).between(20, 80),       '!(20).between(20, 80)');
ok(!( 0).between(20, 80),       '!( 0).between(20, 80)');
ok( (20).between(20, 80, true), ' (20).between(20, 80, true)');
ok(!(20).between(20, 80, 'R'),  '!(20).between(20, 80, "R")');
ok( (20).between(20, 80, 'L'),  ' (20).between(20, 80, "L")');
ok( (20).between(20, 80, 'LR'), ' (20).between(20, 80, "LR")');
ok( (80).between(20, 80, true), ' (80).between(20, 80, true)');
ok( (80).between(20, 80, 'R'),  ' (80).between(20, 80, "R")');
ok(!(80).between(20, 80, 'L'),  '!(80).between(20, 80, "L")');
ok( (80).between(20, 80, 'LR'), ' (80).between(20, 80, "LR")');

// equals
ok( (5).equals(5), '(5).equals(5)' );
ok(!(7).equals(5), '(7).equals(5)' );
notEqual( (0.7+0.1)*10, 8, '(0.7+0.1)*10 != 8' );
ok( ((0.7+0.1)*10).equals(8), '(0.7+0.1)*10.equals(8)' );
ok( (0.123456).equals(0.123456),    ' (0.123456).equals(0.123456)' );
ok(!(0.123456).equals(0.123457),    '!(0.123456).equals(0.123457)' );
ok( (0.123456).equals(0.123457, 4), ' (0.123456).equals(0.123457, 4)' );

// limit
equal((50).limit(20, 80), 50, '(50).limit(20, 80) == 50');
equal((10).limit(20, 80), 20, '(10).limit(20, 80) == 20');
equal((90).limit(20, 80), 80, '(90).limit(20, 80) == 80');

// todo: [qtest] number.round(value)
equal((15.234).round(), 15, '(15.234).round() == 15');

// todo: [qtest] number.toFloat
// todo: [qtest] number.toInt
// todo: [qtest] number.stop

// todo: [qtest] number.Math
});

test('String', function(){
// todo: [qtest] string.safehtml

// repeat
equal('ab-'.repeat(3), 'ab-ab-ab-', 'String.repeat');

// repeat
equal('result is {here}!'.substitute({ here: 123 }), 'result is 123!', 'String.substitute');

// replaceAll
equal('Repl/ace /all "/a"'.replaceAll('/a', '0'), 'Repl0ce 0ll "0"', 'String.replaceAll');

// begins
ok( 'String'.begins('Str'), 'String.begins("Str")');
ok(!'String'.begins('ing'), 'String.begins("ing")');

// [ul]cfirst
equal( 'string'.ucfirst(), 'String', 'String.ucfirst');
equal( 'STRING'.lcfirst(), 'sTRING', 'String.lcfirst');
});

test('Array', function(){
/** Static **/

// todo: [qtest] Array.pickFrom
deepEqual(Array.range(5, 9),    [5,6,7,8,9], 'Array.range(5, 9)');
deepEqual(Array.range(5, 9, 2), [5,  7,  9], 'Array.range(5, 9, 2)');
deepEqual(Array.fill(5, 8),     [8,8,8,8,8], 'Array.fill(5,8)');
deepEqual(Array.collect({a:1, b:2, c:3}, ['a','b','z'], 9), [1,2,9], 'Array.collect');

/** Dynamic **/
// Contains
ok( [1,2,3,4].contains(3), ' [1,2,3,4].contains(3)' );
ok(![1,2,3,4].contains(0), '![1,2,3,4].contains(0)' );

// include
deepEqual([1,2,3].include(4), [1,2,3,4], '[1,2,3].include(4)');
deepEqual([1,2,3].include(3), [1,2,3  ], '[1,2,3].include(3)');

deepEqual([1,2,3].append([2,3,4]), [1,2,3,2,3,4], '[1,2,3].append([2,3,4])');
deepEqual([1,2,3].append([2,3,4], [5,6,7]), [1,2,3,2,3,4,5,6,7], '[1,2,3].append([2,3,4],[5,6,7])');

// erase
deepEqual([1,2,3,1,2,3].erase(2), [1,3,1,3], 'array.erase');
// toKeys
deepEqual(['a','b','c'].toKeys( ), {a:0, b:1, c:2}, 'array.toKeys()');
deepEqual(['a','b','c'].toKeys(9), {a:9, b:9, c:9}, 'array.toKeys(value)');

// combine
deepEqual([1,2,3].combine([2,3,4]), [1,2,3,4], 'array.combine');

// last
equal([6,7,8,9].last, 9, 'array.last');

// random
ok([6,7,8,9].random.between(6, 9, true), 'array.random');

strictEqual([undefined, null,  1, undefined].pick(),    1, 'array.pick, 1');
strictEqual([undefined, null,  0, undefined].pick(),    0, 'array.pick, 0');
strictEqual([undefined, null, '', undefined].pick(),   '', 'array.pick, ""');
strictEqual([undefined, null,     undefined].pick(), null, 'array.pick, null');

deepEqual([
	function (x) { return x * this.i * 0; },
	function (x) { return x * this.i * 1; },
	function (x) { return x * this.i * 2; },
	function (x) { return x * this.i * 3; }
].invoke({i : 2}, 5), [0, 10, 20, 30], 'array.invoke');
// todo: [qtest] array.shuffle
// todo: [qtest] array.sortBy
equal([4, 1, 8, 13, 8].min(),  1, 'array.min');
equal([4, 1, 8, 13, 8].max(), 13, 'array.max');
equal([1, 2, 3, 4, 5].sum(),  15, 'array.sum');
equal([1, 2, 3, 4, 5].average(), 3, 'array.average');
deepEqual([1, 2, 1, 2, 1, 2].unique(), [1,2], 'array.unique');
// todo: [qtest] array.associate
deepEqual([1,2,0,null,'string'].clean(), [1,2,0,'string'], 'array.clean');
deepEqual([1,2,3].empty(), [], 'array.empty');
deepEqual([1,2,3].clone(), [1,2,3], 'array.clone() result is similar to array');
notStrictEqual([1,2,3].clone(), [1,2,3], 'array.clone() result not equals to array');

// todo: [qtest] array.hexToRgb
// todo: [qtest] array.rgbToHex
});

test('Object', function(){
deepEqual(Object.invert({ a:'x', b:'y', c:'z'  }), { x:'a', y: 'b', z: 'c'}, 'Object.invert');
deepEqual(Object.collect({ a:'x', b:'y', c:'z' }, ['a','b','k'], 5), { a:'x', b:'y', k:5}, 'Object.collect');

deepEqual( Object.map({a: 5, b: 6}, function (x) { return x * x }), { a: 25, b: 36 }, 'Object.map');
// todo: [qtest] Object.deepEquals
});

};