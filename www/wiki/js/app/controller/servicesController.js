/**
 * Created by wuxiangan on 2017/3/9.
 */


define(['app',
    'helper/util',
    'helper/storage',
    'text!html/services.html',
], function (app, util, storage, htmlContent) {
    app.registerController('servicesController', ['$scope', 'Account', 'Message', 'github', function ($scope, Account, Message) {
        $scope.showItem = "myVIP";

        // 订单中心
        $scope.clickOrders = function () {
            $scope.showItem = 'orders';

            // $scope.inviteFriend = function () {
            //     if (!$scope.friendMail) {
            //         Message.info("请正确填写好友邮箱地址!!!");
            //         return ;
            //     }
            //     util.post(config.apiUrlPrefix + 'user/inviteFriend',{username:$scope.user.username,friendMail:$scope.friendMail}, function () {
            //         Message.info("邀请邮件已发送给" + $scope.friendMail);
            //         $scope.friendMail = "";
            //     });
            // }
        };

        // 消费记录
        $scope.showMyPay = function () {
            $scope.showItem = 'myPay';
            $scope.payStatus = { "InProgress": "进行中", "Finish": "已完成", "Fail": "失败" };

            util.http("POST", config.apiUrlPrefix + "pay/getTrade", {}, function (data) {
                $scope.myPays = data;
            })

            util.http("GET", config.apiUrlPrefix + "wallet/getBalance", {}, function (data) {
                if (data) {
                    $scope.balance = data.balance;
                } else {
                    $scope.balance = 0;
                }
            })
        }

        $scope.showMyVIP = function () {
            $scope.showItem = 'myVIP';
        };

		$scope.goPayPage = function() {
			util.go("vip");
		}

        $scope.$on('userCenterSubContentType', function (event, item) {
            console.log(item);
            if (item == 'orders')
                $scope.clickOrders();
            else if(item == 'myPay')
                $scope.showMyPay();
            else if(item == 'myVIP')
                $scope.showMyVIP();
        });

        function init() {
        }

		$scope.$watch('viewContentLoaded', function(){
            init();
		});

    }]);

    return htmlContent;
});
