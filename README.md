
Bangular
===
  Backbone data model and collection for AngularJS  
  
  [![Build Status](http://img.shields.io/travis/adrianlee44/bangular.svg?style=flat)](https://travis-ci.org/adrianlee44/bangular)  
  
Version: `0.1.0`  


Backbone factory
---

  To make Backbone work properly with AngularJS, Bangular overrides Backbone's sync and ajax methods.  
  

BangularModel
---

  Base Bangular model extends Backbone.model by adding additional properties and functions, including `$attributes` and `$status`. When overriding BangularModel `set` method but you would like to keep `$attributes`, you'll have to explicitly call BangularModel set:  
  ```javascript  
  var Sample = BangularModel.extend({  
    set: function(key, val, options) {  
      BangularModel.prototype.set.apply(this, arguments);  
    }  
  });  
  ```  
  
  In addition, if you are overriding BangularModel `initialize` method but you would like to keep `$status`, you'll have to explicictly call BangularModel initialize:  
  ```javascript  
  var Sample = BangularModel.extend({  
    initialize: function(key, val, options) {  
      BangularModel.prototype.initialize.apply(this, arguments);  
    }  
  });  
  ```  
  
  The `$attributes` property allows application to use AngularJS two-way binding to manipulate Backbone objects using Backbone `get` and `set`.  
  HTML:  
  ```html  
  <input type="text" ng-model="person.$attributes.name">  
  ```  
  
  Javascript:  
  ```javascript  
  $scope.person = new Person({  
    name: 'John'  
  });  
  ```  
  
  The `$status` property is the hash containing model sync state. Since `$status` updates using Backbone event, passing `{silent: true}` will prevent `$status` from updating. `$status` contains four properties, including:  
  - `deleting`: Set to true when invoking `destroy` method on model (HTTP `DELETE` request)  
  - `loading`:  Set to true when fetching model data from server (HTTP `GET` request)  
  - `saving`:   Set to true when creating or updating model (HTTP `POST` or `PUT` request)  
  - `syncing`:  Set to true whenever a model has started a request to the server  
  
  HTML:  
  ```html  
  <span ng-if="user.$status.loading">Loading</span>  
  <label>{{user.name}}</label>  
  ```  
  
  Javascript:  
  ```javascript  
  $scope.user = new User({id: '123'});  
  $scope.user.fetch();  
  ```  
  

$resetStatus
---

  Reset all properties on `$status` including `deleting`, `loading`, `saving`, and `syncing` back to false  
  

$setStatus
---

  Update model status on `$status`  
  
  
### Parameters
**attributes**  
Type: `Object`  
Set one or multiple statuses  
  
**options**  
Type: `Object`  
Options  
  


BangularCollection
---

  Base Bangular collection extends Backbone.collection by adding additonal properties and functions, such as `$models` and `$status`. When overriding initialize method but you would like to keep `$models` feature, you'll have to explicity call BangularCollection initialize:  
  ```javascript  
  var SampleCollection = BangularCollection.extend({  
    initialize: function(models, options) {  
      BangularCollection.prototype.initialize.apply(this, arguments);  
    }  
  });  
  ```  
  
  The `$models` property creates a one-way binding to collection `models` which is the Javascript array of models. Application can only access the array with `$models` but will not be able to modify it.  
  HTML:  
  ```html  
  <ul>  
    <li ng-repeat="user in users.$models">{{user.username}}<li>  
  </ul>  
  ```  
  
  Javascript:  
  ```  
  $scope.users = new Users();  
  $scope.users.fetch();  
  ```  
  
  The `$status` property is the hash containing collection and its models sync state. Since `$status` updates using Backbone event, passing `{silent: true}` will prevent `$status` from updating. `$status` contains four properties, including:  
  - `deleting`: Set to true when one of its models is getting destroyed (HTTP `DELETE` request)  
  - `loading`:  Set to true when fetching collection data from server (HTTP `GET` request)  
  - `saving`:   Set to true when creating or updating one of its models (HTTP `POST` or `PUT` request)  
  - `syncing`:  Set to true whenever a collection has started a request to the server  
  
  HTML:  
  ```html  
  <ul>  
    <li ng-if="users.$status.loading">Loading...</li>  
    <li ng-repeat="user in users.$models">{{user.username}}<li>  
  </ul>  
  ```  
  
  Javascript:  
  ```  
  $scope.users = new Users();  
  $scope.users.fetch();  
  ```  
  
  

$setStatus
---

  Update collection status  
  
  
Type: `function`  

### Parameters
**attributes**  
Type: `Object`  
Set on or multiple statuses  
  
**options**  
Type: `Object`  
Options  
  


$resetStatus
---

  Reset all statuses including `deleting`, `loading`, `saving`, and `syncing` back to false  
  
Type: `function`  

## Author
[@adrianthemole](http://twitter.com/adrianthemole)
## License
MIT
