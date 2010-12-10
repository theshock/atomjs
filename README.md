## Constructor:
	nano();
	nano('tag .class');
	nano({ tag   : 'tag' });
	nano({ id    : 'id' });
	nano({ Class : 'class' });
	nano(document.getElementsByTagName('tag'));
	nano(selector, context);

#### onready
	nano(function () {
		// DOMContentLoaded
	});
	nano(true, function () {
		// document.onload
	});
	
## Статичные
#### nano.extend(elem = nano, safe = false, from);

Необязательный параметр *Safe* указывает на то, что необходимо наследовать только те свойства, которые еще не реализованы.
Elem - елемент, который необходимо расширить своствами объекта from:

	// Расширить только если в прототипе еще нету метода bind
	config = nano.extend({
		// default values
		a : 15,
		b : 20
	}, config);

#### nano.implement(elem = nano, safe = false, from);
Параметры аналогичны nano.extend, но расширяется прототип elem (нестатичные свойства)
	nano.implement(child, parent);
	nano.implement(Function, true, { bind : function () {} });

#### nano.toArray(elem)
Возвращает массив из немассива:
	var arrayArguments = nano.toArray(arguments);

#### nano.unique(array)
Возвращает массив только с уникальными элементами:
	var newArray = nano.unique([1,2,3,2]); // [1,2,3]

#### nano.contains(array, elem)
Проверяет наличие элемента в массиве и возвращает true/false
	nano.contains([1,2,3], 1); // true

#### nano.log(arg1, arg2, ...)
Алиас для console.log, но не возврашает ошибки в случае отсутствия console

#### nano.isNano(elem)
Проверяет, является ли elem объектом Nano:
	nano.isNano(nano('img')); // true
	nano.isNano(new Image); // false

## Динамичные
#### nanoElem.get(index = 0)
Возвращает html-элемент из текущей коллекции
	nano('img').get();  // первая картинка на странице
	nano('img').get(5); // пятая картинка на странице

#### nanoElem.create(tagName, index = 0)
Создает элемент, добавляет его в ноду с индексом index текущего набора и возвращает его внутри nano:
	// создаем Canvas в пятом div:
	var nanoCanvas = nano('div').create('canvas', 5);

#### nanoElem.each(fn)
Пройти все элементы коллекции функцией (аналог array.forEach):
	nano('div').each(function (div, index) {
		div.className = 'active';
		// this == node('div')
	});

#### nanoElem.css(properties)
Применить CSS ко всем элементам:
	// покрасим все div в красный:
	nano('div').css( 'background', 'red');
	nano('div').css({ background : 'red' });

#### nanoElem.bind(events)
Прикрепить события ко всем элементам.
	nano('div').bind({ click : function () { alert('clicked') } )})

#### nanoElem.find(selector)
Найти элемент внутри коллекции. Аналог nano(selector, context);
	nano('div').find('p') == nano('div p');

#### nanoElem.appendTo(elem)
Прикрепить коллекцию к другому элементу
	nano('img').appendTo('div'); // все картинки прикреплены к div

## JavaScript 1.8.5 Compatiblity
В браузерах, которые не поддерживают JavaScript 1.8.5 реализованы следующие методы:
<ul>
	<li><a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind">Function.prototype.bind</a></li>
	<li><a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys">Object.keys</a></li>
	<li><a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray">Array.isArray</a></li>
</ul>

## nano.rich();
Дополнительно расширяет некоторые встроенные объекты.

#### nano.between(n1, n2, equals);
	(5).between(2, 6); // true
	(6).between(2, 6); // false
	(6).between(2, 6, true); // true

#### nano.equals(to, accuracy = 8);
Позволят сравнивать два float числа (через == их сравнивать нельзя) с точностью до accuracy точек после запятой
	(1.15124124).equals(1.15124124); // true
	(1.15124124).equals(1.15124125); // false
	(1.15124124).equals(1.15124125, 3); // true (1.151 == 1.151)
