/**
 * Created by wuxiangan on 2017/3/9.
 */


define(['app',
    'helper/util',
    'helper/storage',
    'text!html/kaitlynUser.html',
], function (app, util, storage, htmlContent) {
    app.registerController('kaitlynUserController', ['$scope', 'Account', 'Message','modal', function ($scope, Account, Message,modal) {
        function init() {
            // $scope
            // .githubDS = $scope.user.githubDS;
        }

        $scope.$watch('viewContentLoaded', init);
    }]);

    return htmlContent;
});
