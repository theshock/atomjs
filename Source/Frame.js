/*
---

name: "Frame"

description: "Provides cross-browser interface for requestAnimationFrame"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom

inspiration:
  - "[JQuery](http://jquery.org)"

provides: frame

...
*/
(function () {

	var
		callbacks = [],
		remove    = [],
		frameTime = 1000 / 60,
		previous  = Date.now(),
		// we'll switch to real `requestAnimationFrame` here
		// when all browsers will be ready
		requestAnimationFrame = function (callback) {
			window.setTimeout(callback, frameTime);
		};

	requestAnimationFrame(function frame() {
		requestAnimationFrame(frame);

		var index, fn, i, l,
			now = Date.now(),
			// 1 sec is max time for frame to avoid some bugs with too large time
			delta = Math.min(now - previous, 1000);

		for (i = 0, l = remove.length; i < l; i++) {
			index = callbacks.indexOf(remove[i]);
			if (index != -1) {
				callbacks.splice( index, 1 );
			}
		}
		remove.length = 0;

		for (i = 0, l = callbacks.length; i < l; i++) {
			fn = callbacks[i];
			// one of prev calls can remove our fn
			if (remove.indexOf(fn) == -1) {
				fn(delta);
			}
		}

		previous = now;
	});

	atom.extend({
		frame: {
			add: function (fn) {
				if (callbacks.indexOf(fn) == -1) {
					callbacks.push(fn);
				}
				return atom.frame;
			},
			// we dont want to fragmentate callbacks, so remove only before frame started
			remove: function (fn) {
				remove.push(fn);
				return atom.frame;
			}
		}
	});

}());