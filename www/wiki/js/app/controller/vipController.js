/**
 * Created by wuxiangan on 2017/3/9.
 */


define(['app',
    'helper/util',
    'helper/storage',
    'text!html/vip.html',
], function (app, util, storage, htmlContent) {
    app.registerController('vipController', ['$scope', 'Account', 'Message', 'modal', function ($scope, Account, Message, modal) {
        $scope.vips = [];

        function goPay(vip) {
            util.post(config.apiUrlPrefix + 'vip/payVip', vip, function(data){
                if (!data) {
                    Message.info("支付请求失败, 请稍后重试....");
                    return;
                }
                util.go("pay?" + util.getQueryString({
                        app_name:"KEEPWORK",
                        app_goods_id:vip.app_goods_id,
                        price:vip.price,
                        additional:angular.toJson({
                            vip_order_no:data._id,
                        }),
                        redirect: window.location.origin + "/wiki/user_center?userCenterContentType=services&userCenterSubContentType=myVIP",
                    }));
            }, function() {
                Message.info("支付请求失败, 请稍后重试....");
            });
        }

        $scope.selectPrice = function (vip) {
            $scope.selectedVip = vip;
        };

		$scope.goPayPage = function(vip) {
            if (!Account.isAuthenticated()){
               modal('controller/loginController', {
                   controller: 'loginController',
                   size: 'lg',
                   backdrop: true
               }, function (result) {
                   // init(result);
                   goPay(vip);
               }, function (result) {
                   return;
               });
            }else{
                goPay(vip);
			}
		};

        function init() {
			util.post(config.apiUrlPrefix + 'vip/getVipServices', {}, function(data){
				$scope.vips = data || [];
				$scope.selectedVip = data[0] || {};
			});
        }

		$scope.$watch('viewContentLoaded', function(){
			init();
		});
    }]);

    return htmlContent;
});
