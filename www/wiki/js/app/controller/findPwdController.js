/**
 * Created by wuxiangan on 2017/3/9.
 */


define(['app',
    'helper/util',
    'helper/storage',
    'text!html/findPwd.html',
], function (app, util, storage, htmlContent) {
    app.registerController('findPwdController', ['$scope', 'Account', 'Message','modal', function ($scope, Account, Message,modal) {
        function init() {
            // $scope
            // .githubDS = $scope.user.githubDS;
        }

        $scope.$watch('viewContentLoaded', init);
        $scope.sendEmail=function () {
            console.log("给邮箱发送邮件");
        }

        $scope.goLogin=function () {
            $scope.$close("findPwd");
            modal('controller/loginController', {
                controller: 'loginController',
            }, function (result) {
                console.log(result);
                // nowPage.replaceSelection(login.content);
            }, function (result) {
                console.log(result);
            });
        }
    }]);

    return htmlContent;
});
