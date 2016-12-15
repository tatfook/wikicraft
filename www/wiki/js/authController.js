/**
 * Created by wuxiangan on 2016/9/26.
 */

app.controller('loginCtrl', function ($scope, $rootScope, $state, $auth, Account) {
    //$scope.errMsg = "用户名或密码错误";
    $scope.login = function () {
        $scope.errMsg = "";
        var params = {
            email:util.stringTrim($scope.email),
            password:util.stringTrim($scope.password),
        };
        if (!params.email || !params.password) {
            $scope.errMsg = "用户名或密码错误";
            return;
        }
        util.http("POST", config.apiUrlPrefix + 'user/login', params, function (data) {
            $auth.setToken(data.token);
            Account.setUser(data.userInfo);
            console.log("登录成功");
			if (!data.userInfo.githubToken) {
				//Account.githubAuthenticate();
			} 
			$state.go("home");
        }, function (error) {
            $scope.errMsg = error.message;
        });
    }
    
    $scope.githubLogin = function () {
        $auth.authenticate("github").then(function () {
			console.log("github认证成功!!!")
            Account.getProfile();
            $state.go("home");
		}, function(){
			console.log("github认证失败!!!")
            $state.go("home");
		});
    }
});

