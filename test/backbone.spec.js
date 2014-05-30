describe('Backbone', function() {
  var Backbone, $httpBackend, tempModel;

  beforeEach(function() {
    module('Bangular');

    inject(function(_$httpBackend_, _Backbone_) {
      $httpBackend = _$httpBackend_;
      Backbone     = _Backbone_;
    });

    tempModel = new Backbone.Model();
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should override Backbone.ajax with $http', function() {
    var ajaxDefinition = Backbone.ajax.toString();
    expect(ajaxDefinition.indexOf('$http')).not.toBe(-1);
  });

  describe('callbacks', function(){
    it('should call success', function() {
      var success = jasmine.createSpy('success');

      $httpBackend.when('GET', '/test').respond(200, {});

      Backbone.sync('read', tempModel, {
        url:     '/test',
        success: success
      });

      $httpBackend.flush();

      expect(success).toHaveBeenCalled();
    });

    it('should call return data on success', function() {
      var success = function(data) {
        expect(data.message).toBe('success');
      };

      $httpBackend.when('GET', '/test').respond(200, {message: 'success'});

      Backbone.sync('read', tempModel, {
        url:     '/test',
        success: success
      });

      $httpBackend.flush();
    });

    it('should call error', function() {
      var error = jasmine.createSpy('error');

      $httpBackend.when('GET', '/test').respond(400, {});

      Backbone.sync('read', tempModel, {
        url:   '/test',
        error: error
      });

      $httpBackend.flush();

      expect(error).toHaveBeenCalled();
    });

    it('should call return data on error', function() {
      var error = function(data) {
        expect(data.message).toBe('test is broken');
      };

      $httpBackend.when('GET', '/test').respond(400, {message: 'test is broken'});

      Backbone.sync('read', tempModel, {
        url:   '/test',
        error: error
      });

      $httpBackend.flush();
    });
  });

  it('should make a GET request', function() {
    $httpBackend.expectGET('/test').respond(200, {});

    Backbone.sync('read', tempModel, {
      url: '/test'
    });

    $httpBackend.flush();
  });

  it('should make a POST request', function() {
    $httpBackend.expectPOST('/test').respond(200, {});

    Backbone.sync('create', tempModel, {
      url: '/test'
    });

    $httpBackend.flush();
  });

  it('should make a DELETE request', function() {
    $httpBackend.expectDELETE('/test').respond(200, {});

    Backbone.sync('delete', tempModel, {
      url: '/test'
    });

    $httpBackend.flush();
  });

  it('should make a PATCH request', function() {
    $httpBackend.expectPATCH('/test').respond(200, {});

    Backbone.sync('patch', tempModel, {
      url: '/test'
    });

    $httpBackend.flush();
  });

  it('should make a update request', function() {
    $httpBackend.expectPUT('/test').respond(200, {});

    Backbone.sync('update', tempModel, {
      url: '/test'
    });

    $httpBackend.flush();
  });

  it('should stingify attributes on create', function() {
    $httpBackend.expectPOST('/test', '{"hello":"world"}').respond(200, {});


    Backbone.sync('create', tempModel, {
      url: '/test',
      attrs: {
        hello: 'world'
      }
    });

    $httpBackend.flush();

  });

  it('should stringify with model toJSON method', function() {
    $httpBackend.expectPOST('/test', '{"hello":"world"}').respond(200, {});

    tempModel.set({hello: 'world'});

    Backbone.sync('create', tempModel, {
      url: '/test',
      attrs: {
        hello: 'world'
      }
    });

    $httpBackend.flush();
  });

  it('should get the url on model', function() {
    tempModel.urlRoot = '/';
    tempModel.set('id', 'test');

    $httpBackend.expectPOST('/test').respond(200, {});

    Backbone.sync('create', tempModel);

    $httpBackend.flush();
  });

  it('should trigger request event', function() {
    var request = jasmine.createSpy('request');
    tempModel.on('request', request);

    $httpBackend.when('POST', '/test').respond(200, {});

    Backbone.sync('create', tempModel, {
      url: '/test'
    });

    $httpBackend.flush();

    expect(request).toHaveBeenCalled();
  });

});