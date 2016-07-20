module.exports = function(grunt) {
	
	// Load plugins
	require('load-grunt-tasks')(grunt);
	
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		bumpup: {
			options: {
	            updateProps: {
	                pkg: 'package.json'
	            }
	        },
	        file: 'package.json'
		},
		eslint: {
			options: {
				configFile: 'eslint.json'
			},
			target: ['src/angular-selector.js']
		},
		copy: {
			main: {
				files: {
					'dist/angular-selector.js': ['src/angular-selector.js'],
					'dist/angular-selector.css': ['src/angular-selector.css']
				}
			}
		},
		uglify: {
			main: {
				files: {
					'dist/angular-selector.min.js': ['dist/angular-selector.js']
				}
			}
		},
		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1
			},
			main: {
				files: {
					'dist/angular-selector.min.css': ['dist/angular-selector.css']
				}
			}
		},
		header: {
			main: {
				options: {
					text: '/*! angular-selector - v<%= pkg.version %> - https://github.com/indrimuska/angular-selector - (c) 2015 Indri Muska - MIT */'
				},
				files: {
					'dist/angular-selector.js': 'dist/angular-selector.js',
					'dist/angular-selector.css': 'dist/angular-selector.css',
					'dist/angular-selector.min.js': 'dist/angular-selector.min.js',
					'dist/angular-selector.min.css': 'dist/angular-selector.min.css'
				}
			}
		},
		'sync-json': {
			options: {
				include: ['name', 'description', 'version']
			},
			bower: {
				files: {
					"bower.json": "package.json"
				}
			}
		}
	});
	
	// Default tasks.
	grunt.registerTask('default', ['eslint', 'copy', 'uglify', 'cssmin', 'header', 'sync-json']);
	grunt.registerTask('update-patch', ['bumpup:patch', 'default']);
	
};