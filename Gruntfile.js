module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: grunt.file.readJSON('bower.json'),
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      unit: {
        singleRun: false,
        autoWatch: true
      },
      ci: {
        singleRun: true
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        quotmark: 'single',
        undef: true,
        unused: true,
        strict: true,
        browser: true,
        eqnull: true,
        globals: {
          angular: true,
          Backbone: true,
          _: true
        }
      },
      ngBackbone: ['ng-backbone.js'],
      test: {
        options: {
          strict: false,
          globals: {
            afterEach: true,
            beforeEach: true,
            describe: true,
            expect: true,
            inject: true,
            it: true,
            jasmine: true,
            module: true
          }
        },
        src: ['test/*.spec.js']
      }
    },
    chalkboard: {
      ngBackbone: {
        files: [
          {'README.md':  ['ng-backbone.js']}
        ]
      }
    },
    uglify: {
      ngBackbone: {
        options: {
          sourceMap: true,
          sourceMapName: 'ng-backbone.map'
        },
        files: {
          'ng-backbone.min.js': ['ng-backbone.js']
        }
      }
    }
  });

  grunt.registerTask('default', [
    'chalkboard',
    'karma:ci',
    'uglify'
  ]);
};
