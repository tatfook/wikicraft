/**
Author: LiXizhi@yeah.net
Date: 2016.8.23
*/
angular.module('MyApp')
.controller('profileController', function ($scope, $http, $location, Account) {
    $scope.projects = [];
    $scope.message = null;
    $scope.loading = false;
    $scope.userLoaded = false;
    var userid = parseInt($location.search()['userid'] || "-1", 10);
    $scope.user = {};
    $scope.getUser = function () {
        if ($scope.userLoaded == false) {
            $scope.userLoaded = true;
            if (userid != -1) {
                $http.post('/api/wiki/models/user', {
                    _id: userid,
                }).then(function (response) {
                    $scope.user = response.data;
                }).catch(function (response) {
			        $scope.user = {};
			    });
            }
        }
        return $scope.user;
    }
    $scope.isOwner = function() {
        return userid == -1;
    }
    $scope.getProjects = function () {
        if ($scope.loading)
            return;
        $scope.loading = true;
        $http.post("/api/wiki/models/project", {
            userid : userid!=-1 ? userid : null, 
        }).then(function (response) {
            if (response.data && angular.isArray(response.data)) {
                $scope.projects = response.data;
            }
            $scope.loading = false;
        }).catch(function (response) {
            console.log("error:" + response.data.message);
        });
    };
    $scope.gotoGithubPage = function(githubId) {
        $http.get("https://api.github.com/user/" + githubId, {
            skipAuthorization: true, // skipping satellizer pluggin
        })
        .then(function (response) {
            if (response.data && response.data.login) {
                var username = response.data.login;
                window.location.href = "https://github.com/"+username;
            }
        });
    }
    $scope.$watch(Account.isAuthenticated, function (bAuthenticated) {
        if (bAuthenticated) {
            $scope.getProjects();
        } else {
            $scope.projects = [];
        }
    });
    $scope.$on('onUserProfile', function (event, user) {
        if (userid == -1) {
            $scope.user = user;
        }
    });
    // Account.setRequireSignin(true);
});