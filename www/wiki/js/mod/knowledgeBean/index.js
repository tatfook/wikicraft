/**
 * Title: Knowledge Bean
 * Author(s): big
 * Date: 2018.9.25
 * place: Foshan
 * Desc: recharge some haqi goods with knowledge bean
 */

 define([
  'app',
  'helper/util',
  'text!index.html'
 ], function(app, util, html) {
  'use strict';

  var baseUrl = config.httpProto + '://' + config.apiHost + '/api/mod/knowledgeBean/models/knowledgeBean'

  app.registerController('knowledgeBeanController', [
    '$scope',
    function($scope) {
      $scope.recharge = function() {
        console.log(baseUrl)
        // util.post()
      }

      $scope.getGoodsList = function() {
        return [{},{}]
      }
    }
  ])

  return html
 });