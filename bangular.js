/**
 * @chalk
 * @name Bangular
 * @version 0.1.0
 * @author Adrian Lee adrian@adrianlee.me
 * @license MIT
 * @description
 * Backbone data model and collection for AngularJS
 */

(function(window, document, undefined) {
  'use strict';

  angular.module('Bangular', []).
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

        model.trigger('request', model, xhr, options);

        return xhr;
      };

      /**
       * @chalk
       * @name ajax
       * @description
       * Making ajax request
       */
      ajax = function() {
        return $http.apply($http, arguments);
      };

      return _.extend(Backbone, {
        sync: sync,
        ajax: ajax
      });
    }]).

    /**
     * @chalk
     * @name BangularModel
     * @description
     * Base Bangular model with basic customization to support $attributes
     * When overriding initialize method and you would like to keep `$attributes` feature, you'll have to
     * explicity call BangularModel initialize:
     * ```
     * var Sample = BangularModel.extend({
     *   initialize: function(attributes, options) {
     *     BangularModel.prototype.initialize.apply(this, arguments);
     *   }
     * });
     * ```
     */
    factory('BangularModel', ['Backbone', function(Backbone) {
      return Backbone.Model.extend({
        initialize: function(attributes, options) {
          var key, value, defineProperty, self = this;

          this.$attributes = {};

          defineProperty = function(propertyKey) {
            var value = attributes[propertyKey];
            Object.defineProperty(self.$attributes, propertyKey, {
              enumerable: true,
              get: function() {
                return self.get(propertyKey);
              },
              set: function(newValue) {
                self.set(propertyKey, newValue);
              }
            });
          };

          for (key in attributes) {
            defineProperty(key);
          }

          Backbone.Model.prototype.initialize.apply(this, arguments);
        }
      });
    }]).

    /**
     * @chalk
     * @name BangularCollection
     */
    factory('BangularCollection', ['Backbone', 'BangularModel', function(Backbone, BangularModel) {
      return Backbone.Collection.extend({
        model: BangularModel,

        initialize: function(models, options) {
          var self = this;

          Object.defineProperty(this, '$models', {
            enumerable: true,
            get: function() {
              return self.models;
            }
          });

          Backbone.Collection.prototype.initialize.apply(this, arguments);
        }
      });
    }]);

})(window, document);
