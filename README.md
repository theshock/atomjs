Atom Core
=========
#### atom.extend(object, safe = false)
Расширить класс Атома статичными свойствами
Здесь и ниже необязательный параметр *Safe* указывает на то, что необходимо наследовать только те свойства, которые еще не реализованы.

#### atom.implement(object, safe = false)
Расширить класс Атома динамичными свойствами(будут доступны в каждой сущности Атома)

#### atom.extend(object, safe = false,from)
Расширить object свойствами parent
Elem - елемент, который необходимо расширить своствами объекта from:
	// Расширить только если в прототипе еще нету метода bind
	config = atom.extend({
		// default values
		a : 15,
		b : 20
	}, config);

#### atom.implement(object, safe = false, parent)
Расширить прототип object свойствами parent
Параметры аналогичны nano.extend, но расширяется прототип elem (нестатичные свойства)
	nano.implement(child, parent);
	nano.implement(Function, true, { bind : function () { /* code */} });

#### atom.toArray(arrayLikeObject)
Привести объект к массиву
	var args = arom.toArray(atomic);

#### atom.log(arg1, [arg2, ...])
Безопасный алиас console.log

#### atom.isAtom(object)
Проверяет, является ли объект сущностью Атом
	atom.isAtom(atom()); // true


JavaScript 1.8.5 Compatiblity
=============================
В браузерах, которые не поддерживают JavaScript 1.8.5 реализованы следующие методы:
<ul>
	<li><a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind">Function.prototype.bind</a></li>
	<li><a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys">Object.keys</a></li>
	<li><a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray">Array.isArray</a></li>
</ul>


Atom.Plugins.DOM
================
#### Constructor:
	atom();
	atom('tag .class');
	atom({ tag   : 'tag' });
	atom({ id    : 'id' });
	atom({ Class : 'class' });
	atom(document.getElementsByTagName('tag'));
	atom(selector, context);

#### onready
	atom(function () {
		// DOMContentLoaded
	});
	atom().ready(true, function () {
		// document.onload
	});

#### atom().body
	var body = atom().body;

#### atom().get(index = 0)
Возвращает html-элемент из текущей коллекции
	atom('img').get();  // первая картинка на странице
	atom('img').get(5); // пятая картинка на странице

#### atom().create(tagName, index = 0, attr = null)
Создает элемент, добавляет его в ноду с индексом index текущего набора и возвращает его внутри atom:
	// создаем Canvas в пятом div:
	var atomCanvas = atom('div').create('canvas', 5);
	var atomCanvas = atom('div').create('canvas', {
		width  : 400,
		height : 100
	});

#### atom().each(fn)
Пройти все элементы коллекции функцией (аналог array.forEach):
	atom('div').each(function (div, index) {
		div.className = 'active';
		// this == atom('div')
	});

#### atom().css(properties)
Применить CSS ко всем элементам:
	// покрасим все div в красный:
	atom('div').css( 'background', 'red');
	atom('div').css({ background : 'red' });

#### atom().bind(events)
Прикрепить события ко всем элементам.
	atom('div').bind({ click : function () {
		alert('div clicked')
	}});

#### atom().delegate(tagName, event, fn)
Прикрепить события ко всем элементам tagName внутри atomElem
	atom('div').delegate('img', 'click', function () {
		alert('img clicked')
	}});

#### atom().find(selector)
Найти элемент внутри коллекции. Аналог atom(selector, context);
	atom('div').find('p') == atom('div p');

#### atom().appendTo(elem)
Прикрепить коллекцию к другому элементу
	atom('img').appendTo('div'); // все картинки прикреплены к div

#### atom().attr(values)
Установить аттрибут всех элементов коллекции:
	atom('canvas').attr({
		width  : 50,
		height : 50
	});

#### atom().destroy()
Уничтожает все элементы коллекции
	atom('div').destroy();


Atom.Plugins.Types.Number
=========================
#### Number.between(n1, n2, equals);
	(5).between(2, 6); // true
	(6).between(2, 6); // false
	(6).between(2, 6, true); // true

#### Number.equals(to, accuracy = 8);
Позволят сравнивать два float числа (через == их сравнивать нельзя) с точностью до accuracy точек после запятой
	(1.15124124).equals(1.15124124); // true
	(1.15124124).equals(1.15124001); // false
	(1.15124124).equals(1.15124001, 3); // true (1.151 == 1.151)

Atom.Plugins.Types.Array
========================
#### Array.contains(elem);
Ищет в текущем массиве с помощью nano.contains:
	[1,2,3].contains(1); // true


Atom.Plugins.Class
==================
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

Atom.Plugins.Ajax
=================
	atom.ajax(configObject);

#### interval = 0
If %interval% greater than 0 repeat every %interval% seconds

#### type = 'plain'
Type can be 'plain' or 'json'

#### method = 'post'
method can be 'post', 'get', 'put', 'delete'

#### url = location.href
request url

#### callbacks
onLoad, onError
	atom.ajax({
		type   : 'json',
		method : 'get',
		url    : 'test.php',
		onLoad : function (json) {
			atom.log(json);
		},
		onError: function () {
			atom.log('error');
		}
	});

### Atom.Plugins.Ajax + Atom.Plugins.Dom

	atom('#newMsgs').ajax({ // update html of #newMsgs
		interval : 15, // every 15 seconds
		url : 'newMsgs.php'
	});
