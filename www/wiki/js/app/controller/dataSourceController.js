/**
 * Created by wuxiangan on 2017/3/9.
 */


define(['app',
    'helper/util',
    'helper/storage',
    'text!html/dataSource.html',
], function (app, util, storage, htmlContent) {
    app.registerController('dataSourceController', ['$scope', 'Account', 'Message', 'github', function ($scope, Account, Message, github) {
        function init() {
            $scope.githubDS = $scope.user.githubDS;
        }

        $scope.$watch('viewContentLoaded', init);

        $scope.githubDSChange = function () {
            if ($scope.githubDS) {
                Account.linkGithub();
            } else {
                Account.unlinkGithub();
            }
        }
    }]);

    return htmlContent;
});
