atom.declare
============

Lite & fast wrapper for native prototype-based OOP.

	Function atom.declare( String declareName = null, Function parent = null, Object params = null )
	Function atom.declare( Object params )

Each argument is optional. Returns constructor, which can be called with "new".

#### Example:

	var Foo = atom.declare({
		fooMethod: function () {}
	});
	
	var Bar = atom.declare( Foo );

### params

If `params` object without `prototype` property it will be recognized as `prototype`. Else itt will be parsed with next rules:

* `name` - own name of result constructor & instances. Can be user for debug & will returns with `toString` method
		
		var C = atom.declare({
			name: 'FooQux',
			prototype: {}
		});
		console.log( new C().toString() ); // '[object FooQux]'

* `declareName` - property, which will be created by library. Can be used for easy namespace creation. It will automaticaly create all nessesary objects

		atom.declare({
			declareName: 'Foo.Qux.Bar',
			name: 'FQB',
			prototype: {}
		});
		console.log( new Foo.Qux.Bar().toString() ); // '[object FQB]'
	
* `prototype` - with object will be mixed to constructor prototype

		var Foo = atom.declare({
			prototype: {
				fooMethod: function () {
					return 'Foo#fooMethod';
				}
			}
		});
		
		console.log( new Foo().fooMethod() ); // 'Foo#fooMethod'
	
* `parent` - this constructor will be parent of result constructor

		var Foo = atom.declare({
			prototype: {
				fooMethod: function () {
					return 'Foo#fooMethod';
				}
			}
		});
		var Bar = atom.declare({
			parent: Foo,
		
			prototype: {
				barMethod: function () {
					return 'Bar#barMethod';
				}
			}
		});
		
		var foo = new Foo();
		var bar = new Bar();
		
		console.log( foo instanceof Foo ); // true
		console.log( foo instanceof Bar ); // false
		console.log( bar instanceof Foo ); // true
		console.log( bar instanceof Bar ); // true
		
		console.log( foo.fooMethod() ); // 'Foo#fooMethod'
		console.log( bar.fooMethod() ); // 'Foo#fooMethod'
		console.log( bar.barMethod() ); // 'Bar#barMethod'
	
* `own` - this properties will be mixed to constructor as static:

		var Foo = atom.declare({
		
			own: { fooProp: 'foo-static-prop' },
			prototype: {}
		});
		
		var Bar = atom.declare({
			parent: Foo,
			own: { barProp: 'bar-static-prop' },
			prototype: { }
		});
		
		console.log( Foo.fooProp ); // 'foo-static-prop'
		console.log( Bar.fooProp ); // 'foo-static-prop'
		console.log( Bar.barProp ); // 'bar-static-prop'
	
	