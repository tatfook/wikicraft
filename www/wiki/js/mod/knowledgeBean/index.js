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
    '$rootScope',
    '$scope',
    'Account',
    'modal',
    function($rootScope, $scope, Account, modal) {
      $scope.SPENDPAGE = 'SPENDPAGE'
      $scope.LOADINGPAGE = 'LOADINGPAGE'

      $scope.page = $scope.SPENDPAGE
      $scope.myKnowledgeBean = 0
      $scope.spendKnowledgeBean = 0
      $scope.goodsList = []
      $scope.selectGoodsIndex = 0
      $scope.selectHaqiUser = { text: "请选择"}
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
        if (!$scope.selectHaqiUser.text || $scope.selectHaqiUser.text == "请选择") {
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

        $scope.page = $scope.LOADINGPAGE

        function handleSpend(data) {
          if (data && data.status === true) {
            alert("兑换成功！")
          } else {
            alert("兑换失败！")
          }

          location.reload()
        }

        function handleSpendFail() {
          alert("兑换失败！")

          location.reload()
        }

        var url = baseUrl + 'order/spend'

        util.post(url, { buyGoodsList: buyGoodsList, selectHaqiUser: String($scope.selectHaqiUser.text || '') }, handleSpend, handleSpendFail, false)
      }

      $scope.isDisableSpend = function() {
        if ($scope.getCurrentBuyCount() === 0 || $scope.selectHaqiUser.text == "请选择") {
          return 'disabled'
        } else {
          return ''
        }
      }

      $scope.getGoodsList = function() {
        var url = baseUrl + 'order/getGoodsList'

        function handleGoodsList(data) {
          if (Array.isArray(data)) {
            $scope.goodsList = data
            $scope.updateInitSelectGoods()
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

        if ($scope.getSpendKnowledgeBean() > $scope.myKnowledgeBean) {
          selectGoodsInfo.buyCount = selectGoodsInfo.buyCount - 1
          alert("您的知识豆不足以兑换更多的道具")
          return false
        }
      }

      $scope.isShowWarning = function() {
        var selectGoodsInfo = $scope.selectGoodsInfo()
        
        if (!selectGoodsInfo || !selectGoodsInfo.subject) {
          return false
        }

        if (selectGoodsInfo.subject == '捕鱼达人套餐') {
          return true
        } else {
          return false
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

        if(!Array.isArray($scope.goodsList)){
          return false
        }

        for (var x in $scope.goodsList) {
          var item = $scope.goodsList[x]

          if(item) {
            item.buyCount = 0
          }
        }

        $scope.goodsList[$scope.selectGoodsIndex].buyCount = 1

        if ($scope.getSpendKnowledgeBean() > $scope.myKnowledgeBean) {
          $scope.goodsList[$scope.selectGoodsIndex].buyCount = 0
        }
      }

      $scope.getBeansCount = function() {
        var getBeansUrl = baseUrl + 'beans/getUserBeans'

        util.get(
          getBeansUrl,
          {},
          function(data) {
            if (data && data.beans) {
              $scope.myKnowledgeBean = data.beans || 0
              $scope.updateInitSelectGoods()
            }
          },
          function() {},
          false
        )
      }

      $scope.updateInitSelectGoods = function() {
        $scope.updateInitSelectGoods.times = $scope.updateInitSelectGoods.times ? $scope.updateInitSelectGoods.times + 1 : 1
        // when getBeansCount and getGoodsList finish, it will be execute

        if ($scope.updateInitSelectGoods.times == 2) {
          if ($scope.goodsList && $scope.goodsList.length > 0) {
            $scope.goodsList[0].buyCount = 1
  
            if ($scope.getSpendKnowledgeBean() > $scope.myKnowledgeBean) {
              $scope.goodsList[0].buyCount = 0
            }
          }
        }
      }

      function getUsername() {
        var cookie = document.cookie.split(";")
        var token = ''

        for (var item in cookie) {
          var curCookie = cookie[item]

          if (typeof(curCookie) != 'string') {
            return false
          }

          var currentItem = curCookie.replace(/ /g, '')

          if(currentItem.substring(0, 6) == "token=") {
            token = currentItem.substring(6)
          }
        }

        function showModal() {
          modal('controller/loginController', {
            controller: 'loginController',
            size: 'lg',
            backdrop: true
          }, 
          function (result) { }, 
          function (result) { });
        }

        if (!token) {
          showModal()
          return false
        }

        if (!Account || !Account.user || !Account.user.username || !Account.user.portrait) {
          setTimeout(
            function() {
              $scope.$apply(getUsername)
            }, 500
          )
          return false
        }

        $scope.username = Account.user.username
        $scope.userThumbnail = Account.user.portrait
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
        $scope.getHaqiUsers()

        setTimeout(
          function() {
            $scope.$apply(getUsername)
          },
          0
        )
      }

      $scope.$watch('$viewContentLoaded', init)
    }
  ])

  return html
 });