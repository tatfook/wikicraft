/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app', 'helper/util', 'text!html/join.html'], function (app, util, htmlContent) {
    app.registerController('joinController', ['$scope', '$auth', 'Account','modal', function ($scope, $auth, Account,modal) {
        //$scope.errMsg = "用户名或密码错误";
        $scope.isModal=false;
        $scope.step=1;

        function init() {
        }

        $scope.$watch('$viewContentLoaded', init);

        // 检查账号名（不可为纯数字，不可包含@符号）
        $scope.checkInput=function () {
            $scope.errMsg = "";
            var username=$scope.username?$scope.username : "";
            var pwd=$scope.password?$scope.password : "";
            console.log(username);
            if(/^\d+$/.test(username)){
                $scope.errMsg="*账户名不可为纯数字";
                return;
            }
            if(/@/.test(username)){
                $scope.errMsg="*账户名不可包含@符号";
                return;
            }
            if(pwd.length<6){
                $scope.errMsg="*密码最少6位";
                return;
            }
        }
        
        // 注册
        $scope.register = function () {
            $scope.errMsg = "";

            var params = {
                username: $scope.username? $scope.username.trim():"",
                password: $scope.password? $scope.password.trim():"",
            };

            if(!params.username){
                $scope.errMsg="*账户名为必填字段";
                return;
            }
            if(/^\d+$/.test(params.username)){
                $scope.errMsg="*账户名不可为纯数字";
                return;
            }
            if(/@/.test(params.username)){
                $scope.errMsg="*账户名不可包含@符号";
                return;
            }
            if(params.password.length<6){
                $scope.errMsg="*密码最少6位";
                return;
            }

            util.http("POST", config.apiUrlPrefix + "user/register", params, function (data) {
                console.log("注册成功")
                $scope.step++;
                $auth.setToken(data.token);
                Account.setUser(data.userInfo);
            }, function (error) {
                $scope.errMsg = error.message;
                console.log($scope.errMsg );
            });
        }

        $scope.goUserCenter=function () {
            util.go('usercenter',true);
        }

        $scope.goUserHome=function () {
            util.goUserSite('/'+$scope.username);
        }

        $scope.goLicense=function () {
            util.go('license',true);
        }

        $scope.qqLogin = function () {
            console.log("QQ登录");
        }

        $scope.wechatLogin = function () {
            console.log("微信登录");
        }

        $scope.sinaWeiboLogin = function () {
            console.log("新浪微博登录");
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
                    util.goUserSite('/' + response.data.userInfo.username);
                }
            }, function () {
                console.log("github认证失败!!!");
            });
        }
    }]);
    return htmlContent;
});