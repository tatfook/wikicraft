/**
 * Created by wuxiangan on 2017/3/9.
 */


define(['app',
    'helper/util',
    'helper/storage',
    'text!html/myVIP.html',
], function (app, util, storage, htmlContent) {
    app.registerController('myVIPController', ['$scope', 'Account', 'Message', 'github', function ($scope, Account, Message, github) {
        function init() {
            // $scope.githubDS = $scope.user.githubDS;
        }

        $scope.$watch('viewContentLoaded', init);

        $scope.goVipPage=function () {
            util.go("vip");
        }
    }]);

    return htmlContent;
});
