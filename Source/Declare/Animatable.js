/*
---

name: "Animatable"

description: "Provides Color class"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom
	- declare
	- Transition
	- Events
	- Settings
	- Types.Object

provides: Animatable

...
*/


declare( 'atom.Animatable',
/** @class atom.Animatable */
{
	defaultCallbacks: function (element) {
		return {
			get: function (property) {
				return atom.object.path.get(element, property);
			},
			set: atom.overloadSetter(function (property, value) {
				return atom.object.path.set(element, property, value);
			})
		};
	},
	
	element: null,

	initialize: function (callbacks) {
		if (!callbacks) throw new TypeError( 'callbacks cant be null' );

		if (this.isValidCallbacks(callbacks)) {
			this.callbacks = callbacks;
		} else {
			this.callbacks = this.defaultCallbacks(callbacks);
		}
	},

	/** @private */
	isValidCallbacks: function (callbacks) {
		return typeof callbacks == 'object' &&
			Object.keys(callbacks).length == 2 &&
			isFunction(callbacks.set) &&
			isFunction(callbacks.get);
	},

	animate: atom.ensureObjectSetter(function (properties) {
		return new atom.Animatable.Animation(this, properties).start();
	}),

	get: function (name) {
		return this.callbacks.get.apply(this.element, arguments);
	},

	set: function (name, value) {
		return this.callbacks.set.apply(this.element, arguments);
	}
});

declare( 'atom.Animatable.Animation',
/** @class atom.Animatable.Animation */
{
	/** @property {atom.Animatable} */
	animatable: null,

	/**
	 * initial values of properties
	 * @property {Object}
	 */
	initial: null,

	/**
	 * target values of properties
	 * @property {Object}
	 */
	target: null,

	initialize: function (animatable, settings) {
		this.bindMethods('tick');

		if (!settings.props) settings = {props: settings};
		this.events   = new atom.Events(this);
		this.settings = new atom.Settings({
				fn  : 'linear',
				time: 1000
			})
			.set(settings)
			.addEvents(this.events);
		this.animatable = animatable;
		this.transition = atom.Transition.get(this.settings.get('fn'));
		this.allTime = this.settings.get('time');
		this.target  = this.settings.get('props');
	},

	start: function () {
		this.initial  = this.fetchInitialValues();
		this.delta    = this.countValuesDelta();
		this.timeLeft = this.allTime;
		atom.frame.add(this.tick);
		return this;
	},

	/** @private */
	countValuesDelta: function () {
		var initial = this.initial;
		return atom.object.map(this.target, function (value, key) {
			return value - initial[key];
		});
	},

	/** @private */
	fetchInitialValues: function () {
		var animatable = this.animatable;
		return atom.object.map(this.target, function (value, key) {
			return animatable.get(key);
		});
	},

	/** @private */
	tick: function (time) {
		var lastTick = time >= this.timeLeft;
		this.timeLeft = lastTick ? 0 : this.timeLeft - time;

		this.changeValues(this.transition(
			lastTick ? 1 : (this.allTime - this.timeLeft) / this.allTime
		));
		this.events.fire( 'tick', [ this ]);

		if (lastTick) this.destroy();
	},

	/** @private */
	changeValues: function (progress) {
		var delta = this.delta;
		for (var i in delta) {
			this.animatable.set( i, this.initial[i] + delta[i] * progress );
		}
	},

	destroy: function () {
		this.events.fire( 'finish', [ this ]);
		atom.frame.remove(this.tick);
		return this;
	}
});