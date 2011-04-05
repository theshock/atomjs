
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
