/**
 * @memberOf fp.utils
 */
(function (module) {
  'use strict';

  var camelCasedName = _.camelCase(module.name);

  /**
   * The loading interceptor.
   * Broadcasts 'fpUtils.loading.'-prefixed 'show' and 'hide' events
   * on the root scope when dealing with external requests.
   * @constructor LoadingInterceptor
   * @param {Object} $rootScope - The Angular root scope.
   * @param {Object} $q - The Angular $q service.
   */
  function LoadingInterceptor($rootScope, $q) {
    var service = this;

    /**
     * Broadcast a given event (passing the request config object)
     * only when dealing with API requests that do not have
     * a truthy skipFPLoadingInterceptor setup in config.
     * @private
     * @function broadcast
     * @param {String} event
     * @param {Object} config - Angular $http config object.
     */
    function broadcast(event, config) {
      var out = /^http(?:s)?:\/\//.test(config.url);
      if (!out || config.skipFPLoadingInterceptor) { return; }
      $rootScope.$broadcast(camelCasedName + '.loading.' + event, config);
    }

    /**
     * To be called when a request is being made.
     * @method request
     * @param {Object} config - Angular $http config object.
     * @return {Object}
     */
    service.request = function (config) {
      broadcast('show', config);
      return config;
    };

    /**
     * To be called when a request got a response.
     * @method request
     * @param {Object} response - Angular $http response object.
     * @return {Object}
     */
    service.response = function (response) {
      broadcast('hide', response.config);
      return response;
    };

    /**
     * To be called when a request encountered an error.
     * @method request
     * @param {Object} config - Angular $http config object.
     * @return {Promise}
     */
    service.requestError = function (config) {
      return $q.reject(service.response(config));
    };

    /**
     * To be called when a response is an error.
     * @method request
     * @param {Object} response - Angular $http response object.
     * @return {Promise}
     */
    service.responseError = function (response) {
      return service.requestError(response);
    };
  }

  module.service('loadingInterceptor', [
    '$rootScope',
    '$q',
    LoadingInterceptor
  ]);

}(angular.module('fp.utils')));
