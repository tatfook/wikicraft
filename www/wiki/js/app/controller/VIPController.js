/**
 * Created by wuxiangan on 2017/3/9.
 */


define(['app',
    'helper/util',
    'helper/storage',
    'text!html/VIP.html',
], function (app, util, storage, htmlContent) {
    app.registerController('VIPController', ['$scope', 'Account', 'Message', 'github', function ($scope, Account, Message, github) {
        $scope.vips = [
            {
                "month":"1",
                "price":"15"
            },
            {
                "month":"3",
                "price":"45"
            },
            {
                "month":"12",
                "price":"150"
            }
        ];
        $scope.payPrice = $scope.vips[0].price || 0;

        $scope.selectPrice = function (vip) {
            $scope.payPrice = vip.price;
        };

        function init() {
            // $scope.githubDS = $scope.user.githubDS;
        }

        $scope.$watch('viewContentLoaded', init);
    }]);

    return htmlContent;
});
