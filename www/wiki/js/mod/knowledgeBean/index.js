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

  var baseUrl = config.httpProto + '://' + config.apiHost + '/api/mod/knowledgeBean/models/'

  app.registerController('knowledgeBeanController', [
    '$scope',
    function($scope) {
      $scope.SPENDPAGE = 'SPENDPAGE'
      $scope.LOADINGPAGE = 'LOADINGPAGE'

      $scope.page = $scope.SPENDPAGE
      $scope.myKnowledgeBean = 0
      $scope.spendKnowledgeBean = 0
      $scope.goodsList = []

      $scope.spend = function() {
        // $scope.page = $scope.LOADINGPAGE
        var buyGoodsList = []

        for (var x in $scope.goodsList) {
          var currentGoods = $scope.goodsList[x]

          if (currentGoods.buyCount && currentGoods.buyCount > 0) {
            buyGoodsList[buyGoodsList.length] = {
              goodsId: currentGoods._id,
              buyCount: currentGoods.buyCount
            }
          }
        }

        if (buyGoodsList.length === 0) {
          alert("没有选择任何物品")
          return false
        }

        function handleSpend(data) {
          
        }

        var url = baseUrl + 'order/spend'

        util.post(url, { buyGoodsList: buyGoodsList }, handleSpend, function() {}, false)
      }

      $scope.getGoodsList = function() {
        var url = baseUrl + 'order/getGoodsList'

        function handleGoodsList(data) {
          if (Array.isArray(data)) {
            $scope.goodsList = data
          }
        }

        util.post(url, {}, handleGoodsList, function() {}, false)
      }

      $scope.getCurrentBuyCount = function(item) {
        return item.buyCount || 0
      }

      $scope.minus = function(item) {
        if (!item.buyCount || typeof(item.buyCount) != 'number') {
          item.buyCount = 0
        } else {
          if (item.buyCount < 1) {
            item.buyCount = 0
          } else {
            item.buyCount = item.buyCount - 1
          }
        }
      }

      $scope.plus = function(item) {
        if (!item.buyCount || typeof(item.buyCount) != 'number') {
          item.buyCount = 1
        } else {
          item.buyCount = item.buyCount + 1
        }
      }

      $scope.getSpendKnowledgeBean = function() {
        var spendKnowledgeBean = 0

        for (var x in $scope.goodsList) {
          var currentGoods = $scope.goodsList[x]

          if(currentGoods && currentGoods.bean && currentGoods.buyCount) {
            spendKnowledgeBean = spendKnowledgeBean + (currentGoods.buyCount * currentGoods.bean)
          }
        }

        return spendKnowledgeBean
      }

      function init() {
        var queryArgs = util.getQueryObject()

        $scope.username = queryArgs.username || ''
        $scope.haqiNum = queryArgs.haqiNum || ''

        $scope.getGoodsList()

        var getBeansUrl = baseUrl + 'beans/getUserBeans'

        util.get(
          getBeansUrl,
          {},
          function(data) {
            if (data && data.beans) {
              $scope.myKnowledgeBean = data.beans
            }
          },
          function() {},
          false
        )
      }

      $scope.$watch('$viewContentLoaded', init)
    }
  ])

  return html
 });