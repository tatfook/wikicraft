/**
 * Created by wuxiangan on 2017/1/6.
 */

define(['app',
    'text!html/fans.html',
    'helper/util',
    'helper/storage',
], function (app, htmlContent, util, storage) {
    app.registerController("fansController", ['$scope', 'Account', function ($scope, Account) {
        function init() {
            util.http("POST", config.apiUrlPrefix + "user_fans/getByUserId", {userId:$scope.user._id}, function (data) {
                $scope.totalItems = data.total;
                $scope.fansList = data.userList || [];
                //console.log($scope.fansList);
            });
        }
        
        $scope.$watch('$viewContentLoaded', function () {
            Account.ensureAuthenticated(init);
        });
    }]);

    return htmlContent;
});

