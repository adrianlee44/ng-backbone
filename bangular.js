/*
  @chalk
  @name Bangular
  @version 0.1.0
  @author [@adrianthemole](http://twitter.com/adrianthemole)
  @license MIT
  @dependencies
  - [AngualrJS](https://angularjs.org)
  - [UnderscoreJS](http://underscorejs.org) / [LoDash](http://lodash.com)
  - [BackboneJS](http://backbonejs.org)
  @description
  Backbone data model and collection for AngularJS

  [![Build Status](http://img.shields.io/travis/adrianlee44/bangular.svg?style=flat)](https://travis-ci.org/adrianlee44/bangular)
*/

(function(window, document, undefined) {
  'use strict';

  angular.module('Bangular', []).
    /*
      @chalk
      @name Backbone factory
      @description
      To make Backbone work properly with AngularJS, Bangular overrides Backbone's sync and ajax methods.
    */
    factory('Backbone', ['$http', function($http) {
      var methodMap, sync, ajax, isUndefined = _.isUndefined;

      methodMap = {
        create: 'POST',
        update: 'PUT',
        patch: 'PATCH',
        delete: 'DELETE',
        read: 'GET'
      };

      sync = function(method, model, options) {
        var params, xhr;

        if (isUndefined(options)) {
          options = {};
        }

        params = {
          method: methodMap[method]
        };

        if (!options.url) {
          params.url = _.result(model, 'url');
        }

        if (isUndefined(options.data) && model && (method === 'create' || method === 'update' || method === 'patch')) {
          params.data = JSON.stringify(options.attrs || model.toJSON(options));
        }

        // AngularJS $http doesn't convert data to querystring for GET method
        if (method === 'read' && !isUndefined(options.data)) {
          params.params = options.data;
        }

        xhr = options.xhr = ajax(_.extend(params, options)).
          success(function(data) {
            if (!isUndefined(options.success) && _.isFunction(options.success)) {
              options.success(data);
            }
          }).
          error(function(data) {
            if (!isUndefined(options.error) && _.isFunction(options.error)) {
              options.error(data);
            }
          });

        model.trigger('request', model, xhr, _.extend(params, options));

        return xhr;
      };

      /*
        @chalk
        @private
        @name ajax
        @description
        Making ajax request
      */
      ajax = function() {
        return $http.apply($http, arguments);
      };

      return _.extend(Backbone, {
        sync: sync,
        ajax: ajax
      });
    }]).

    /*
      @chalk
      @name BangularModel
      @description
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
    */
    factory('BangularModel', ['$rootScope', 'Backbone', function($rootScope, Backbone) {
      var defineProperty;

      defineProperty = function(key) {
        var self = this;
        Object.defineProperty(this.$attributes, key, {
          enumerable: true,
          configurable: true,
          get: function() {
            return self.get(key);
          },
          set: function(newValue) {
            self.set(key, newValue);
          }
        });
      };

      return Backbone.Model.extend({
        initialize: function() {
          this.$status = {
            deleting: false,
            loading:  false,
            saving:   false,
            syncing:  false
          };

          this.on('request', function(model, xhr, options) {
            this.$setStatus({
              deleting: (options.method === 'DELETE'),
              loading:  (options.method === 'GET'),
              saving:   (options.method === 'POST' || options.method === 'PUT'),
              syncing:  true
            });
          });

          this.on('sync error', this.$resetStatus);

          Backbone.Model.prototype.initialize.apply(this, arguments);
        },

        set: function(key, val, options) {
          var output = Backbone.Model.prototype.set.apply(this, arguments);

          // Do not set binding if attributes are invalid
          if (output) {
            this.$setBinding(key, val, options);
          }

          return output;
        },

        /*
          @chalk
          @name $resetStatus
          @description
          Reset all properties on `$status` including `deleting`, `loading`, `saving`, and `syncing` back to false
        */
        $resetStatus: function() {
          return this.$setStatus({
            deleting: false,
            loading:  false,
            saving:   false,
            syncing:  false
          });
        },

        /*
          @chalk
          @private
          @name setBinding
          @description
          Add binding on `$attributes` to a key on `attributes`
        */
        $setBinding: function(key, val, options) {
          var attr, attrs, unset;

          if (_.isUndefined(key)) {
            return this;
          }

          if (_.isObject(key)) {
            attrs = key;
            options = val;
          } else {
            (attrs = {})[key] = val;
          }

          options = options || {};

          if (_.isUndefined(this.$attributes)) {
            this.$attributes = {};
          }

          unset = options.unset;

          for (attr in attrs) {
            if (unset && this.$attributes.hasOwnProperty(attr)) {
              delete this.$attributes[attr];
            } else if (!unset && !this.$attributes[attr]) {
              defineProperty.call(this, attr);
            }
          }

          return this;
        },

        /*
          @chalk
          @name $setStatus
          @description
          Update model status on `$status`

          @param {Object} attributes Set one or multiple statuses
          @param {Object} options Options
        */
        $setStatus: function(key, value, options) {
          var attr, attrs;

          if (_.isUndefined(key)) {
            return this;
          }

          if (_.isObject(key)) {
            attrs = key;
            options = value;
          } else {
            (attrs = {})[key] = value;
          }

          options = options || {};

          for (attr in this.$status) {
            if (attrs.hasOwnProperty(attr) && _.isBoolean(attrs[attr])) {
              this.$status[attr] = attrs[attr];
            }
          }
        },

        $removeBinding: function(attr, options) {
          return this.$setBinding(attr, void 0, _.extend({}, options, {unset: true}));
        }
      });
    }]).

    /*
      @chalk
      @name BangularCollection
      @description
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

    */
    factory('BangularCollection', ['Backbone', 'BangularModel', function(Backbone, BangularModel) {
      return Backbone.Collection.extend({
        model: BangularModel,

        initialize: function() {
          var self = this;

          // Initialize status object
          this.$status = {
            deleting: false,
            loading:  false,
            saving:   false,
            syncing:  false
          };

          this.on('request', function(model, xhr, options) {
            this.$setStatus({
              deleting: (options.method === 'DELETE'),
              loading:  (options.method === 'GET'),
              saving:   (options.method === 'POST' || options.method === 'PUT'),
              syncing:  true
            });
          });

          this.on('sync error', this.$resetStatus);

          Object.defineProperty(this, '$models', {
            enumerable: true,
            get: function() {
              return self.models;
            }
          });

          Backbone.Collection.prototype.initialize.apply(this, arguments);
        },

        /*
          @chalk
          @name $setStatus
          @function
          @description
          Update collection status

          @param {Object} attributes Set on or multiple statuses
          @param {Object} options    Options
        */
        $setStatus: function(key, value, options) {
          var attr, attrs;

          if (_.isUndefined(key)) {
            return this;
          }

          if (_.isObject(key)) {
            attrs = key;
            options = value;
          } else {
            (attrs = {})[key] = value;
          }

          options = options || {};

          for (attr in this.$status) {
            if (attrs.hasOwnProperty(attr) && _.isBoolean(attrs[attr])) {
              this.$status[attr] = attrs[attr];
            }
          }
        },

        /*
          @chalk
          @name $resetStatus
          @function
          @description
          Reset all statuses including `deleting`, `loading`, `saving`, and `syncing` back to false
        */
        $resetStatus: function() {
          return this.$setStatus({
            deleting: false,
            loading:  false,
            saving:   false,
            syncing:  false
          });
        }
      });
    }]);

})(window, document);
