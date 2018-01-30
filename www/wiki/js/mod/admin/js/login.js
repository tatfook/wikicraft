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

		var urlPrefix = "/wiki/js/mod/admin/js/";
        function init() {
			if (!Account.isAuthenticated()) {
				return;
			}

			var payload = $auth.getPayload();
			
			if (payload.isAdmin) {
				util.go(urlPrefix + "index");
			}
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
            util.http("POST", config.apiUrlPrefix + 'admin/login', params, function (data) {
                $auth.setToken(data.token);
                Account.setUser(data.userinfo);
                // console.log("登录成功");
                util.go(urlPrefix + "index");
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












