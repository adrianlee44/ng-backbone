module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'node_modules/angular/angular.js',
      'node_modules/underscore/underscore.js',
      'node_modules/backbone/backbone.js',
      'ng-backbone.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'test/*.spec.js'
    ],
    reporters: ['dots', 'coverage'],
    preprocessors: {
      'ng-backbone.js': ['coverage']
    },
    browsers: ['PhantomJS'],
    coverageReporter: {
      reporters: [
        { type: 'lcovonly', subdir: '.'}
      ]
    }
  });
};
