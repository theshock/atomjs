/*
---

name: "Animatable"

description: "Provides Color class"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- Core
	- declare
	- frame
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
			set: atom.core.overloadSetter(function (property, value) {
				return atom.object.path.set(element, property, value);
			})
		};
	},
	
	element: null,

	initialize: function (callbacks) {
		this.bindMethods('animate');

		if (!callbacks) throw new TypeError( 'callbacks cant be null' );

		this.animations = [];
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
			coreIsFunction(callbacks.set) &&
			coreIsFunction(callbacks.get);
	},

	/** @private */
	animations: null,

	animate: atom.core.ensureObjectSetter(function (properties) {
		return this.next(new atom.Animatable.Animation(this, properties));
	}),

	get current () {
		return this.animations[0];
	},

	/** @private */
	next: function (animation) {
		var queue = this.animations;
		if (animation) {
			queue.push(animation);
			if (queue.length == 1) {
				this.launch(animation);
			}
		} else if (queue.length) {
			this.launch(this.current);
		}
		return animation;
	},
	/** @private */
	launch: function (animation) {
		var queue = this.animations, animatable = this;
		animation.events.add('destroy', function remove () {
			queue.splice(queue.indexOf(animation), 1);
			animation.events.remove('destroy', remove);
			animatable.next();
		});
		animation.start();
	},

	stop: function (all) {
		var current = this.current;
		if (current) {
			if (all) this.animations.length = 0;
			current.destroy('stop');
		}
		return this;
	},

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
				time: 500
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

		if (lastTick) this.destroy('complete');
	},

	/** @private */
	changeValues: function (progress) {
		var delta = this.delta;
		for (var i in delta) {
			this.animatable.set( i, this.initial[i] + delta[i] * progress );
		}
	},

	destroy: function (type) {
		if (!type) type = 'error';
		this.events.fire( type, [ this ]);
		this.events.fire( 'destroy', [ this ]);
		atom.frame.remove(this.tick);
		return this;
	}
});