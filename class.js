var Animal = atom.Class({
	constructor : function (name) {
		this.name   = name;
		this.weight = 30;
		this.log('Animal.constructor');
	},
	log : function (msg) {
		atom.log(msg + ' (' + this.name + ')');
		return this;
	},
	walk : function (km) {
		this.weight -= km || 1;
		return this.log('Animal.walk');
	},
	eat : function (kg) {
		this.weight += kg || 1;
		return this.log('Animal.eat');
	}
});

var DomesticAnimal = atom.Class(Animal, {
	constructor : function (name, breed) {
		this.parent(name); // Constructor as default
		this.breed = breed;
		return this.log('DomesticAnimal.constructor');
	},
	test : function () {
		this.log('DomesticAnimal.test');
	},
	walk : function (km) {
		this.log('DomesticAnimal.walk')
		return this.parent(km);
	},
	getRuBreed : function () {
		this.log('DomesticAnimal.getRuBreed');
		return this.self.ruBreeds[this.breed];
	}
});

var Dog = atom.Factory(DomesticAnimal, {
	constructor : function (name, breed) {
		this.parent(name); // Constructor as default
		this.breed = breed;
		return this.log('Dog.constructor');
	},
	bark : function () {
		return this.log('Dog.bark');
	}
}).extend({
	ruBreeds : {
		shepherd  : 'овчарка',
		dalmatian : 'далматинец',
		pitbull   : 'питбуль'
	}
}).get();

console.log('--------- Cat ----------')
var cat = new DomesticAnimal('Tom', 'Blue');
cat.walk();
console.log('cat instanceof Dog: ', cat instanceof Dog);
console.log('cat instanceof DomesticAnimal: ', cat instanceof DomesticAnimal);
console.log('cat instanceof Animal: ', cat instanceof Animal);

console.log('--------- Dog ----------')
var dog = new Dog('Box', 'shepherd');
console.log('dog instanceof Dog: ', dog instanceof Dog);
console.log('dog instanceof DomesticAnimal: ', dog instanceof DomesticAnimal);
console.log('dog instanceof Animal: ', dog instanceof Animal);
dog.eat();
dog.bark();
atom.log(dog.getRuBreed());