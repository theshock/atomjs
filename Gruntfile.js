module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			browser: {
				src: ['<%= browser_src_files %>'],
				dest: 'lib/atom-full-compiled.js'
			}
		},
		core_src_files: [
			'Source/Core.js',
			'Source/Accessors.js',
			'Source/CoreExtended.js',
			'Source/Types/Number.js',
			'Source/Types/Array.js',
			'Source/Types/Object.js',
			'Source/Prototypes/Abstract.js',
			'Source/Types/Function.js',
			'Source/Types/*.js',
			'Source/Prototypes/*.js',
			'Source/Class/Class.js',
			'Source/Class/*.js',
			'Source/Declare/Declare.js',
			'Source/Declare/Settings.js',
			'Source/Declare/ClassCompat.js',
			'Source/Declare/Color.js',
			'Source/Declare/Events.js',
			'Source/Declare/Registry.js'
		],
		browser_src_files: [
			'Source/_before.js',
			'Source/Js185.js',
			'<%= core_src_files %>',
			'Source/Dom.js',
			'Source/Ajax.js',
			'Source/Ajax.Dom.js',
			'Source/Cookie.js',
			'Source/Frame.js',
			'Source/PointerLock.js',
			'Source/Uri.js',
			'Source/Declare/Animatable.js',
			'Source/Declare/ImagePreloader.js',
			'Source/Declare/Keyboard.js',
			'Source/Declare/Trace.js',
			'Source/Declare/Transition.js',
			'Source/_after.js'
		]
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.registerTask('default', ['concat']);
};
