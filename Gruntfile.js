var pad = function(n) { return ('0' + n).slice(-2); },
    now = function(d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); };

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      all: {
        files: ['src/**/*.js', 'spec/**/*.coffee'],
        tasks: ['default', 'test']
      }
    },
    jshint: {
      all: ['dist/<%= pkg.name %>.js']
    },
    jasmine_node: {
      useCoffee: true,
      extensions: 'coffee',
      projectRoot: __dirname
    },
    'expand-include': {
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.js',
        options: {
          stripHeaderOfInclude: false,
          globalDefines: {
            major: "<%= pkg.version.split('.')[0] %>",
            minor: "<%= pkg.version.split('.')[1] %>",
            micro: "<%= pkg.version.split('.')[2] %>",
            date: now(new Date())
          }
        }
      }
    },
    uglify: {
      build: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-expand-include');

  grunt.registerTask('default', ['expand-include', 'jshint']);
  grunt.registerTask('build', ['default', 'uglify']);
  grunt.registerTask('test', ['jasmine_node']);
};
