module.exports = function(grunt) {
	
	// Load plugins
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		copy: {
			main: {
				files: {
					'dist/angular-selector.js': ['src/angular-selector.js'],
					'dist/angular-selector.css': ['src/angular-selector.css']
				}
			}
		},
		uglify: {
			options: {
				banner: '/*! angular-selector - v<%= pkg.version %> - https://github.com/indrimuska/angular-selector - (c) 2015 Indri Muska - MIT */\n'
			},
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
		}
	});
	
	// Default tasks.
	grunt.registerTask('default', ['copy', 'uglify', 'cssmin']);
	
};