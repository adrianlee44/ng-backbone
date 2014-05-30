describe('BangularModel', function() {
  var BangularModel, tempModel;

  beforeEach(function() {
    module('Bangular');

    inject(function(_BangularModel_) {
      BangularModel = _BangularModel_;
    });

    tempModel = new BangularModel();
  });

  it('should create $attributes object', function() {
    expect(tempModel.$attributes).toBeDefined();
  });

  it('should get the correct attribute', function() {
    tempModel = new BangularModel({
      hello: 'world',
      foo: 'bar'
    });

    expect(tempModel.$attributes.hello).toBe('world');
    expect(tempModel.$attributes.hello1).toBeUndefined();
  });

  it('should set an attribute', function() {
    tempModel = new BangularModel({
      test: 'foo'
    });

    tempModel.$attributes.test = 'testing';

    expect(tempModel.get('test')).toBe('testing');
  });

  it('should trigger a change event', function() {
    var change = jasmine.createSpy('change'),
        changeFoo = jasmine.createSpy('change:foo');


    tempModel = new BangularModel({
      foo: 'bar'
    });
    tempModel.on('change', change);
    tempModel.on('change:foo', changeFoo);

    tempModel.$attributes.foo = 'bar123';

    expect(change).toHaveBeenCalled();
    expect(changeFoo).toHaveBeenCalled();
  });
});