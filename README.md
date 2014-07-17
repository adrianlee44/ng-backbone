
Bangular
===
  Backbone data model and collection for AngularJS  
  
Version: `0.1.0`  


Backbone factory
---

  To make Backbone work properly with AngularJS, Bangular override Backbone's sync and ajax methods. Application using Bangular should take advantage of Backbone factory to use $http service and invoke AngularJS cycle properly  
  

BangularModel
---

  Base Bangular model with support for $attributes, $status and event propagations When overriding set method but would like to keep  `$attributes` feature, you'll have to explicity call BangularModel set:  
  ```  
  var Sample = BangularModel.extend({  
    set: function(key, val, options) {  
      BangularModel.prototype.set.apply(this, arguments);  
    }  
  });  
  ```  
  
  `$attributes` allows application to use AngularJS two-way binding to manipulate Backbone objects using Backbone `get` and `set`  
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
  
  

$resetStatus
---

  Reset all statuses including `deleting`, `loading`, `saving`, and `syncing` back to false  
  

$setStatus
---

  Update model status  
  
  
### Parameters
**attributes**  
Type: `Object`  
Set one or multiple statuses  
  
**options**  
Type: `Object`  
Options  
  


BangularCollection
---

  Base Bangular collection with support for $models. When overriding initialize method and you would like to keep `$models` feature, you'll have to explicity call BangularCollection initialize:  
  ```javascript  
  var SampleCollection = BangularCollection.extend({  
    initialize: function(models, options) {  
      BangularCollection.prototype.initialize.apply(this, arguments);  
    }  
  });  
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
@adrianthemole
## License
MIT
