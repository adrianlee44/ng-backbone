/*
  @chalk
  @name Bangular
  @version 0.1.0
  @author @adrianthemole
  @license MIT
  @description
  Backbone data model and collection for AngularJS
*/

(function(window, document, undefined) {
  'use strict';

  angular.module('Bangular', []).
    /*
      @chalk
      @name Backbone factory
      @description
      To make Backbone work properly with AngularJS, Bangular override Backbone's sync and ajax methods. Application using Bangular should take advantage of Backbone factory to use $http service and invoke AngularJS cycle properly
    */
    factory('Backbone', ['$http', function($http) {
      var methodMap, sync, ajax;

      methodMap = {
        create: 'POST',
        update: 'PUT',
        patch: 'PATCH',
        delete: 'DELETE',
        read: 'GET'
      };

      sync = function(method, model, options) {
        var params, xhr;

        if (options == null) {
          options = {};
        }

        params = {
          method: methodMap[method]
        };

        if (!options.url) {
          params.url = _.result(model, 'url');
        }

        if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
          params.data = JSON.stringify(options.attrs || model.toJSON(options));
        }

        // AngularJS $http doesn't convert data to querystring for GET method
        if (method === 'read' && options.data != null) {
          params.params = options.data;
        }

        xhr = options.xhr = ajax(_.extend(params, options)).
          success(function(data) {
            if (options.success != null && _.isFunction(options.success)) {
              options.success(data);
            }
          }).
          error(function(data) {
            if (options.error != null && _.isFunction(options.error)) {
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
          var output;

          if (output = Backbone.Model.prototype.set.apply(this, arguments)) {
            this.$setBinding(key, val, options);
          }

          return output;
        },

        /*
          @chalk
          @name $resetStatus
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

          if (key == null) {
            return this;
          }

          if (_.isObject(key)) {
            attrs = key;
            options = val;
          } else {
            (attrs = {})[key] = val;
          }

          options = options || {};

          if (this.$attributes == null) {
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
          Update model status

          @param {Object} attributes Set one or multiple statuses
          @param {Object} options Options
        */
        $setStatus: function(key, value, options) {
          var attr, attrs;

          if (key == null) {
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
      Base Bangular collection with support for $models. When overriding initialize method and you would like to keep `$models` feature, you'll have to explicity call BangularCollection initialize:
      ```javascript
      var SampleCollection = BangularCollection.extend({
        initialize: function(models, options) {
          BangularCollection.prototype.initialize.apply(this, arguments);
        }
      });
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

          if (key == null) {
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
