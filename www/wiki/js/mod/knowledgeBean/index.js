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
    'Account',
    'modal',
    function($scope, Account, modal) {
      $scope.SPENDPAGE = 'SPENDPAGE'
      $scope.LOADINGPAGE = 'LOADINGPAGE'

      $scope.page = $scope.SPENDPAGE
      $scope.myKnowledgeBean = 0
      $scope.spendKnowledgeBean = 0
      $scope.goodsList = []
      $scope.selectGoodsIndex = 0
      $scope.selectHaqiUser = {}
      $scope.haqiUsers = []
      $scope.userThumbnail = ''

      $scope.isActiveGoods = function(index) {
        if ($scope.selectGoodsIndex == index) {
          return true
        } else {
          return false
        }
      }

      $scope.getThumbnail = function(url) {
        if (url) {
          return url
        } else {
          return '/wiki/assets/imgs/default_portrait.png'
        }
      }

      $scope.selectGoodsInfo = function() {
        if ($scope.goodsList[$scope.selectGoodsIndex]) {
          return $scope.goodsList[$scope.selectGoodsIndex]
        } else {
          return false
        }
      }

      $scope.spend = function() {
        if (!$scope.selectHaqiUser.text) {
          alert("没有选择数字账号")
          return false
        }

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
          if (data && data.status === true) {
            alert("购买成功！")
          } else {
            alert("购买失败！")
          }

          location.reload()
        }

        var url = baseUrl + 'order/spend'

        util.post(url, { buyGoodsList: buyGoodsList, selectHaqiUser: String($scope.selectHaqiUser.text || '') }, handleSpend, function() {}, false)
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

      $scope.getCurrentBuyCount = function() {
        var selectGoodsInfo = $scope.selectGoodsInfo()

        if (!selectGoodsInfo) {
          return 0
        }

        if (!selectGoodsInfo.buyCount || typeof(selectGoodsInfo.buyCount) != 'number') {
          selectGoodsInfo.buyCount = 0
        } 

        return selectGoodsInfo.buyCount
      }

      $scope.minus = function() {
        var selectGoodsInfo = $scope.selectGoodsInfo()

        if (!selectGoodsInfo) {
          return false
        }

        if (!selectGoodsInfo.buyCount || typeof(selectGoodsInfo.buyCount) != 'number') {
          selectGoodsInfo.buyCount = 0
        } else {
          if (selectGoodsInfo.buyCount < 1) {
            selectGoodsInfo.buyCount = 0
          } else {
            selectGoodsInfo.buyCount = selectGoodsInfo.buyCount - 1
          }
        }
      }

      $scope.plus = function() {
        var selectGoodsInfo = $scope.selectGoodsInfo()

        if (!selectGoodsInfo) {
          return false
        }

        if (!selectGoodsInfo.buyCount || typeof(selectGoodsInfo.buyCount) != 'number') {
          selectGoodsInfo.buyCount = 1
        } else {
          selectGoodsInfo.buyCount = selectGoodsInfo.buyCount + 1
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

      $scope.selectGoods = function(index) {
        $scope.selectGoodsIndex = index
      }

      $scope.getBeansCount = function() {
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

      $scope.getUsername = function() {
        setTimeout(function() {
          if (Account.isAuthenticated() && Account.user) {
            $scope.username = Account.user.username
            $scope.userThumbnail = Account.user.portrait
          } else {
            modal('controller/loginController', {
              controller: 'loginController',
              size: 'lg',
              backdrop: true
            }, 
            function (result) { }, 
            function (result) { });
          }
        }, 0)
      }

      $scope.getHaqiUsers = function () {
        var getHaqiUsersUrl = baseUrl + 'haqi/getUsers'

        util.get(
          getHaqiUsersUrl,
          {},
          function (data) {
            $scope.haqiUsers = data
          },
          function() {},
          false
        )
      }

      function init() {
        $scope.getGoodsList()
        $scope.getBeansCount()
        $scope.getUsername()
        $scope.getHaqiUsers()
      }

      $scope.$watch('$viewContentLoaded', init)
    }
  ])

  return html
 });