module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'bower_components/angular/angular.js',
      'bower_components/underscore/underscore.js',
      'bower_components/backbone/backbone.js',
      'ng-backbone.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'test/*.spec.js'
    ],
    reports: ['progress'],
    browsers: ['PhantomJS']
  });
};
