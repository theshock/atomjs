
Wrapper for native prototype-based OOP

### Base class creating
	var NameLogger = atom.Class({
		log : function (msg) {
			atom.log(this.name, msg);
			return this;
		}
	});

### Class creating with constuctor, static variable
	var Animal = atom.Class({
		Extends: NameLogger,
		Static: {
			staticProperty: 'animal'
		},
		initialize : function (name) {
			this.name = name;
			this.log('Animal.initialize');
		},
		walk : function () {
			this.log('Animal.walk');
		}
	});

### Extending classes
	var Dog = atom.Class({
		Extends: Animal,
		initialize : function (name, breed) {
			this.parent(name);
			this.breed = breed;
			this.log('Dog.initialize');
		},
		bark : function () {
			return this.log('Dog.bark');
		},
		logStatic : function () {
			this.log(this.self.staticProperty);
		},
		isSelf : function () {
			return this instanceof this.self; // always true
		}
	});

### using
	var dog = new Dog('Box', 'shepherd');
	dog.bark();
	dog.walk();
	atom.log(dog instanceof Animal); // true
	atom.log(dog instanceof Dog); // true

### Factory method:
	var cat = Animal.factory(['Tom']);
	var dog = Dog.factory(['Max', 'dalmatian']);

### Properties
`self` You can use property "self" to get the link to the class as in methods `logStatic` and `isSelf`

`parent` You can use method `parent` to call method with the same name of the parent

`factory` You can use static factory property to create instance of object with array of arguments

	new Point(3, 8);
	// equals to
	Point.factory([3, 8]);

### Methods
Available some methods helpers:

`abstractMethod`, witch thrown mistake if is not overriden

`protectedMethod`, witch can be called only with parents

`hiddenMethod`, witch not implemented in children (not equals to private)

	var MyClass = atom.Class({
		abstr: atom.Class.abstractMethod,

		initialize: atom.Class.hiddenMethod(function () {
			atom.log('initilize will not be implemented by children (hidden)');
		}),

		prot: atom.Class.protectedMethod(function() {
			atom.log('this is protected method');
		})
	});

### Expanding prototype, no reset
Unlike the MooTools we dont reset each object. So the objects are links in prototype:

	var MyClass = atom.Class({
		settings: {},
		initialize: function (width, height) {
			this.settings.width  = width;
			this.settings.height = height;
		}
	});

	var small = new MyClass(100, 100);
	var big   = new MyClass(555, 555);

	atom.log(small.settings. == big.settings); // true
	atom.log(small.settings.width, small.settings.height); // (555, 555)

So, use constructor object creating instead:

	var MyClass = atom.Class({
		initialize: function (width, height) {
			this.settings = {};
			this.settings.width  = width;
			this.settings.height = height;
		}
	});

	var small = new MyClass(100, 100);
	var big   = new MyClass(555, 555);

	atom.log(small.settings. == big.settings); // false
	atom.log(small.settings.width, small.settings.height); // (100, 100), as expected