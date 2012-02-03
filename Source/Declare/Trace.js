/*
---

name: "Trace"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- declare
	- dom
	- CoreExtended

provides: Trace

...
*/

declare( 'atom.Trace', {
	own: {
		dumpRec : function (obj, level, plain) {
			level  = parseInt(level) || 0;

			var escape = function (v) {
				return plain ? v : atom.string.safeHtml(v);
			};

			if (level > 5) return '*TOO_DEEP*';

			if (obj && typeof obj == 'object' && coreIsFunction(obj.dump)) return obj.dump();

			var subDump = function (elem, index) {
					return tabs + '\t' + index + ': ' + this.dumpRec(elem, level+1, plain) + '\n';
				}.bind(this),
				type = atom.typeOf(obj),
				tabs = '\t'.repeat(level);

			switch (type) {
				case 'array':
					return '[\n' + obj.map(subDump).join('') + tabs + ']';
					break;
				case 'object':
					var html = '';
					for (var index in obj) html += subDump(obj[index], index);
					return '{\n' + html + tabs + '}';
				case 'element':
					var prop = (obj.width && obj.height) ? '('+obj.width+'×'+obj.height+')' : '';
					return '[DOM ' + obj.tagName.toLowerCase() + prop + ']';
				case 'textnode':
				case 'whitespace':
					return '[DOM ' + type + ']';
				case 'null':
					return 'null';
				case 'boolean':
					return obj ? 'true' : 'false';
				case 'string':
					return escape('"' + obj + '"');
				default:
					return escape('' + obj);
			}
		},
		dumpPlain: function (object) {
			return (this.dumpRec(object, 0, true));
		},
		dump : function (object) {
			return (this.dumpRec(object, 0));
		}
	},

	prototype: {
		initialize : function (object) {
			this.value = object;
			this.stopped = false;
			return this;
		},
		set value (value) {
			if (!this.stopped && !this.blocked) {
				var html = atom.string.replaceAll( this.self.dump(value), {
					'\t': '&nbsp;'.repeat(3),
					'\n': '<br />'
				});
				this.createNode().html(html);
			}
		},
		destroy : function (force) {
			var trace = this;
			if (force) this.stop();
			trace.node.css('background', '#300');
			trace.timeout = setTimeout(function () {
				if (trace.node) {
					trace.node.destroy();
					trace.node = null;
				}
			}, 500);
			return trace;
		},
		/** @private */
		stop  : function () {
			this.stopped = true;
			return this;
		},
		/** @private */
		getContainer : function () {
			var cont = atom.dom('#traceContainer');
			return cont.length ? cont :
				atom.dom.create('div', { 'id' : 'traceContainer'})
					.css({
						'zIndex'   : '87223',
						'position' : 'fixed',
						'top'      : '3px',
						'right'    : '6px',
						'maxWidth' : '70%',
						'maxHeight': '100%',
						'overflowY': 'auto',
						'background': 'rgba(0,192,0,0.2)'
					})
					.appendTo('body');
		},
		/** @deprecated */
		trace : function (value) {
			this.value = value;
			return this;
		},
		/** @private */
		events : function (remove) {
			var trace = this;
			// add events unbind
			!remove || trace.node.bind({
				mouseover : function () {
					trace.node.css('background', '#222');
				},
				mouseout  : function () {
					trace.node.css('background', '#000');
				},
				mousedown : function () {
					trace.blocked = true;
				},
				mouseup : function () {
					trace.blocked = false;
				}
			});
			return trace.node;
		},
		/** @private */
		createNode : function () {
			var trace = this, node = trace.node;

			if (node) {
				if (trace.timeout) {
					clearTimeout(trace.timeout);
					trace.events(node);
					node.css('background', '#000');
				}
				return node;
			}

			trace.node = atom.dom
				.create('div')
				.css({
					background : '#000',
					border     : '1px dashed #0c0',
					color      : '#0c0',
					cursor     : 'pointer',
					fontFamily : 'monospace',
					margin     : '1px',
					minWidth   : '200px',
					overflow   : 'auto',
					padding    : '3px 12px',
					whiteSpace : 'pre'
				})
				.appendTo(trace.getContainer())
				.bind({
					click    : function () { trace.destroy(0) },
					dblclick : function () { trace.destroy(1) }
				});
			return trace.events();
		}
	}
});