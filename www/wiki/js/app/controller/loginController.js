/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app', 'helper/util', 'text!html/login.html'], function (app, util, htmlContent) {
    app.registerController('loginController', ['$scope', '$auth', 'Account','modal', function ($scope, $auth, Account,modal) {
        //$scope.errMsg = "用户名或密码错误";
        $scope.isModal=false;

        function init() {
            if ((!config.localEnv || config.localVMEnv) && window.location.pathname !="/wiki/login"){
                $scope.isModal=true;
            }
        }

        $scope.$watch('$viewContentLoaded', init);

        $scope.goRegisterPage = function () {
            util.go('home');
        }
        
        $scope.findPwd=function () {
            $scope.$close("login");
            util.go("findPwd");
        }

        $scope.login = function () {
            $scope.errMsg = "";
            var params = {
                email: util.stringTrim($scope.email),
                password: util.stringTrim($scope.password),
            };
            if (!params.email || !params.password) {
                $scope.errMsg = "用户名或密码错误";
                $("#total-err").removeClass("visible-hidden");
                return;
            }
            util.http("POST", config.apiUrlPrefix + 'user/login', params, function (data) {
                $auth.setToken(data.token);
                Account.setUser(data.userInfo);
                console.log("登录成功");
                /*
                if (!data.userInfo.githubToken) {
                    Account.githubAuthenticate();
                }
                */
                if ($scope.isModal) {
                    $scope.$close(data.userInfo);
                } else {
                    util.go('home');
                }

            }, function (error) {
                $scope.errMsg = error.message;
                $("#total-err").removeClass("visible-hidden");
            });
        }

        $scope.githubLogin = function () {
            $auth.authenticate("github").then(function (response) {
                if (!response.data.token || !response.data.userInfo) {
                    Message.info("github 登录失败!!!");
                    return ;
                }
                console.log("github认证成功!!!");
                $auth.setToken(response.data.token);
                Account.setUser(response.data.userInfo);
                if ($scope.isModal) {
                    $scope.$close(response.data.userInfo);
                } else {
                    util.go('website');
                }
            }, function () {
                console.log("github认证失败!!!");
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