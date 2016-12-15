/**
 * Created by wuxiangan on 2016/12/8.
 */

app.controller('headerCtrl', function ($scope, $state, $auth, Account, Message) {
    //console.log("headerCtrl");
    $scope.isLogin = Account.isAuthenticated();
    $scope.user = Account.getUser();

    $scope.goLoginPage = function () {
        window.location.href="/#/login";
    }

    $scope.goRegisterPage = function () {
        window.location.href="/#/home";
    }

    $scope.goHomePage = function () {
        window.location.href="/#/home";
    }

    $scope.goPersonalPage = function () {
		if (!$scope.isLogin) {
			console.log("----");
			Message.info("请先登录!!!");
			return;
		}
        window.location.href = "/" + $scope.user.username;
    }
    $scope.logout = function () {
        $auth.logout();
        $scope.isLogin = false;
        window.location.href="/#/home";
    }

    $scope.$on("onUserProfile", function (event, user) {
        $scope.user = user;
    });

    $scope.$watch(Account.isAuthenticated, function (bAuthenticated) {
        $scope.isLogin = bAuthenticated;
    });
});
