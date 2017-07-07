/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/admin/html/login.html',
], function (app, util, htmlContent) {
    app.registerController('loginController', ['$scope', '$auth', 'Account','modal', function ($scope, $auth, Account,modal) {
        //$scope.errMsg = "用户名或密码错误";

        function init() {
        }

        $scope.$watch('$viewContentLoaded', init);

        $scope.login = function () {
            $scope.errMsg = "";
            var params = {
                username: util.stringTrim($scope.username),
                password: util.stringTrim($scope.password),
            };
            if (!params.username || !params.password) {
                $scope.errMsg = "用户名或密码错误";
                $("#total-err").removeClass("visible-hidden");
                return;
            }
            util.http("POST", config.apiUrlPrefix + 'user/login', params, function (data) {
                $auth.setToken(data.token);
                Account.setUser(data.userinfo);
                console.log("登录成功");
                util.goUserSite('/' + data.userinfo.username);
            }, function (error) {
                $scope.errMsg = error.message;
                $("#total-err").removeClass("visible-hidden");
            });
        }


        $(document).keyup(function (event) {
            if(event.keyCode=="13"){
                $scope.login();
            }
        });
    }]);
    return htmlContent;
});












