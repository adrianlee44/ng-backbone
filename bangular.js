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
     * Base Bangular model with support for $attributes
     * When overriding set method and you would like to keep `$attributes` feature, you'll have to
     * explicity call BangularModel set:
     * ```
     * var Sample = BangularModel.extend({
     *   set: function(key, val, options) {
     *     BangularModel.prototype.set.apply(this, arguments);
     *   }
     * });
     * ```
     */
    factory('BangularModel', ['Backbone', function(Backbone) {
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
        set: function(key, val, options) {
          if (Backbone.Model.prototype.set.apply(this, arguments)) {
            this.setBinding(key, val, options);
          }
        },

        /**
         * @chalk
         * @private
         * @name setBinding
         * @description
         *
         */
        setBinding: function(key, val, options) {
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

          options || (options = {});

          if (this.$attributes == null) {
            this.$attributes = {};
          }

          unset = options.unset;

          for (attr in attrs) {
            if (unset && this.$attributes.hasOwnProperty(attr)) {
              delete this.$attributes[attr]
            } else if (!unset && !this.$attributes[attr]) {
              defineProperty.call(this, attr);
            }
          }

          return this;
        },

        removeBinding: function(attr, options) {
          return this.setBinding(attr, void 0, _.extend({}, options, {unset: true}));
        }
      });
    }]).

    /**
     * @chalk
     * @name BangularCollection
     * @description
     * Base Bangular collection with support for $models
     * When overriding initialize method and you would like to keep `$models` feature, you'll have to
     * explicity call BangularCollection initialize:
     * ```
     * var SampleCollection = BangularCollection.extend({
     *   initialize: function(models, options) {
     *     BangularCollection.prototype.initialize.apply(this, arguments);
     *   }
     * });
     * ```
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
