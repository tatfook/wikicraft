/**
 * Created by big on 2017/7/6.
 */

define([
    'app',
    'helper/util',
    'pingpp',
    'text!html/pay.html',
], function (app, util, pingpp, htmlContent) {
    app.registerController("payController", ['$scope', 'Account', 'modal', '$rootScope', function ($scope, Account, modal, $rootScope) {
        console.log(pingpp);
        var queryArgs = util.getQueryObject();

        $scope.price = 0.01;

        if (Account.ensureAuthenticated()) {
            Account.getUser(function (userinfo) {
                $scope.userinfo = userinfo;
                //console.log($scope.user);
            });
        }

        $scope.alipay = function () {
            alert("使用支付宝付款");
        }

        $scope.wechat = function () {
            alert("使用微信付款");
        }
    }]);

    return htmlContent;
});