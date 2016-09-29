angular.module('MyApp')
.directive('pwCheck', [function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.pwCheck;
            elem.add(firstPassword).on('keyup', function () {
                scope.$apply(function () {
                    var v = elem.val() === $(firstPassword).val();
                    ctrl.$setValidity('pwmatch', v);
                });
            });
        }
    }
}])
.controller('settingsController', function ($scope, $http, Account, github) {
    $scope.user = {};
    $scope.account = {};

    $scope.$watch(Account.getUser, function (newValue, oldValue) {
        $scope.user = angular.copy(newValue);
    });
	$scope.changePassword = function (oldpassword, newpassword) {
	    $http.post("/api/wiki/models/user/changepw", { oldpassword: oldpassword, newpassword: newpassword, })
            .then(function (response) {
                if (response.data && response.data.success) {
                    alert("保存完毕!");
                }
            }).catch(function (response) {
                alert("保存出错了!" + response.data.message);
            });
	};
	$scope.updateProfile = function () {
	    if ($scope.user && $scope.user.displayName) {
	        Account.updateProfile($scope.user);
	    }
	};
	$scope.deleteAccount = function () {
	    if (!$scope.account.showConfirm) {
	        $scope.account.showConfirm = true;
	        return;
	    }
	    else if ($scope.account.confirmname == $scope.user.displayName)
	    {
	        $http.delete("/api/wiki/models/user", {})
            .then(function (response) {
                if (response.data) {
                    alert("用户已经删除!");
                }
            }).catch(function (response) {
                alert("无法删除，请先删除你所有的网站!");
            });
	    }
	};
	$scope.setEmail = function (email) {
	    $http.post("/api/wiki/models/user/setemail", { email: email,})
            .then(function (response) {
                if (response.data && response.data.email == email) {
                    Account.getUser().email = email;
                    alert("设置成功, 你可以用Email和密码登录了!");
                }
            }).catch(function (response) {
                alert("保存出错了!"+response.data.message);
            });
	}
	$scope.linkGithub = function () {
	    Account.linkGithub();
	};
	$scope.unlinkGithub = function () {
	    Account.unlinkGithub();
	};
	$scope.fetchGithubUser = function () {
	    github.getUserInfo();
	};
	$scope.fetchGithubRepos = function () {
	    github.getRepos();
	};
    // support #account, #profile in the url for nav tabs
	var hash = window.location.hash;
	hash && $('ul.nav a[href="' + hash + '"]').tab('show');

	Account.setRequireSignin(true);
});