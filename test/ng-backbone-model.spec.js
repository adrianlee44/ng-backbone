describe('NgBackboneModel', function() {
  var NgBackboneModel, tempModel;

  beforeEach(function() {
    module('ngBackbone');

    inject(function(_NgBackboneModel_) {
      NgBackboneModel = _NgBackboneModel_;
    });

    tempModel = new NgBackboneModel();
  });

  it('should have NgBackboneModel as the constructor name', function(){
    expect(tempModel.constructor.name).toBe('NgBackboneModel');
  });

  it('should create $attributes object', function() {
    expect(tempModel.$attributes).toBeDefined();
  });

  it('should get the correct attribute', function() {
    tempModel = new NgBackboneModel({
      hello: 'world',
      foo: 'bar'
    });

    expect(tempModel.$attributes.hello).toBe('world');
    expect(tempModel.$attributes.hello1).toBeUndefined();
  });

  it('should set an attribute', function() {
    tempModel = new NgBackboneModel({
      test: 'foo'
    });

    tempModel.$attributes.test = 'testing';

    expect(tempModel.get('test')).toBe('testing');
  });

  it('should trigger a change event', function() {
    var change = jasmine.createSpy('change'),
        changeFoo = jasmine.createSpy('change:foo');


    tempModel = new NgBackboneModel({
      foo: 'bar'
    });
    tempModel.on('change', change);
    tempModel.on('change:foo', changeFoo);

    tempModel.$attributes.foo = 'bar123';

    expect(change).toHaveBeenCalled();
    expect(changeFoo).toHaveBeenCalled();
  });

  it('should unset a property on $attributes', function() {
    tempModel = new NgBackboneModel({
      foo: 'bar'
    });

    tempModel.unset('foo');

    expect(tempModel.$attributes.hasOwnProperty('foo')).toBe(false);
  });

  it('should unset a property with removeBinding', function() {
    tempModel = new NgBackboneModel({
      foo: 'bar'
    });

    tempModel.$removeBinding('foo');

    expect(tempModel.$attributes.hasOwnProperty('foo')).toBe(false);
  });

  describe('$status', function() {
    var model, $httpBackend;

    beforeEach(inject(function(_$httpBackend_) {
      model = new NgBackboneModel();

      $httpBackend = _$httpBackend_;
    }));

    it('should create $status object', function() {
      expect(model.$status).toBeDefined();
    });

    it('should default all status to false', function() {
      expect(model.$status.deleting).toBe(false);
      expect(model.$status.loading).toBe(false);
      expect(model.$status.saving).toBe(false);
      expect(model.$status.syncing).toBe(false);
    });

    describe('syncing should be updated', function(){
      it('should set on GET request', function() {
        $httpBackend.when('GET', '/get').respond({});

        model.fetch({url: '/get'});

        expect(model.$status.syncing).toBe(true);

        $httpBackend.flush();
      });

      it('should set on POST request', function() {
        $httpBackend.when('POST', '/post').respond({});

        model.save({}, {url: '/post'});

        expect(model.$status.syncing).toBe(true);

        $httpBackend.flush();
      });
    });

    describe('loading should be updated', function() {
      it('should set on GET request', function() {
        $httpBackend.when('GET', '/get').respond({});

        model.fetch({url: '/get'});

        expect(model.$status.loading).toBe(true);

        $httpBackend.flush();
      });

      it('should not set on POST request', function() {
        $httpBackend.when('POST', '/post').respond({});

        model.save({}, {url: '/post'});

        expect(model.$status.loading).toBe(false);

        $httpBackend.flush();
      });
    });

    describe('saving should be updated', function() {
      it('should set on POST request', function() {
        $httpBackend.when('POST', '/post').respond({});

        model.save({}, {url: '/post'});

        expect(model.$status.saving).toBe(true);

        $httpBackend.flush();
      });

      it('should set on PUT request', function() {
        $httpBackend.when('PUT', '/put').respond({});

        model = new NgBackboneModel({
          id: 'test-123'
        });

        model.save({name: 'hello'}, {url: '/put'});

        expect(model.$status.saving).toBe(true);

        $httpBackend.flush();
      });

      it('should not set on GET request', function() {
        $httpBackend.when('GET', '/get').respond({});

        model.fetch({url: '/get'});

        expect(model.$status.saving).toBe(false);

        $httpBackend.flush();
      });
    });

    describe('deleting should be updated', function() {
      it('should set on DELETE request', function() {
        $httpBackend.when('DELETE', '/delete').respond({});

        model = new NgBackboneModel({
          id: 'test-123'
        });

        model.destroy({url: '/delete'});

        expect(model.$status.deleting).toBe(true);

        $httpBackend.flush();
      });

      it('should not set on POST request', function() {
        $httpBackend.when('POST', '/post').respond({});

        model.save({}, {url: '/post'});

        expect(model.$status.deleting).toBe(false);

        $httpBackend.flush();
      });
    });
  });
});
