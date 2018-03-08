/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'text!html/login.html'
], function (app, util, storage,  htmlContent) {
    app.registerController('loginController', ['$scope', '$auth', 'Account','modal', function ($scope, $auth, Account,modal) {
        //$scope.errMsg = "用户名或密码错误";
        $scope.isModal=false;
		$scope.keepPassword = storage.localStorageGetItem("keepPassword");

        function init() {
            if ((!config.localEnv || config.localVMEnv) && window.location.pathname !="/wiki/login" && window.location.pathname !="/wiki/join"){
                $scope.isModal=true;
            }
        }

        $scope.$watch('$viewContentLoaded', init);

		$scope.changeKeepPassword = function() {
			//console.log($scope.keepPassword);
			//Account.keepPassword($scope.keepPassword);
			storage.localStorageSetItem("keepPassword", $scope.keepPassword);
		}

        $scope.goRegisterPage = function () {
            util.go('/wiki/join');
        }
        
        $scope.findPwd=function (isModal) {
            if(isModal){
                $scope.$close("login");
            }
            util.go("/wiki/findPwd");
        }

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
				//storage.sessionStorageSetItem("satellizer_token", data.token);
                $auth.setToken(data.token);
                Account.setUser(data.userinfo);
                // console.log("登录成功");
                if ($scope.isModal) {
                    window.location.reload();
                } else {
                    util.go('/' + data.userinfo.username);
                }

            }, function (error) {
                $scope.errMsg = error.message;
                $("#total-err").removeClass("visible-hidden");
            });
        }

        $scope.qqLogin = function () {
            // console.log("QQ登录");
            Authenticate("qq");
        }

        $scope.wechatLogin = function () {
            // console.log("微信登录");
            Authenticate("weixin");
        }

        $scope.sinaWeiboLogin = function () {
            // console.log("新浪微博登录");
            Authenticate("xinlangweibo");
        }

        $scope.githubLogin = function () {
            // console.log("github登录");
            Authenticate("github");
        }

        $scope.cancel = function () {
            $scope.$dismiss();
        }

        function Authenticate(serviceName) {
            Account.authenticate(serviceName, function (data) {
                if ($auth.isAuthenticated()) {
                    Account.setUser(data.data);
                    if ($scope.isModal) {
                        $scope.$close(data.data);
                    } else {
                        util.go('/' + data.data.username);
                    }
                } else {
                    // 用户不存在 注册用户并携带data.data信息
                    storage.sessionStorageSetItem("userThreeService", data.data);
                    util.go("/wiki/join");
                }
            }, function (data) {

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
