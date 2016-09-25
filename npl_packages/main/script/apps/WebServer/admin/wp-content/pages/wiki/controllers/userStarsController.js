/**
Author: LiXizhi@yeah.net
Date: 2016.8.22
*/
angular.module('MyApp')
.controller('userStarsController', function ($scope, $http, $location, Account) {
    $scope.projects = [];
    $scope.message = null;
    $scope.currentPage = 1;
    $scope.items_per_page = 12;
    $scope.loading = false;
    $scope.userLoaded = false;
    var userid = parseInt($location.search()['userid'] || "-1", 10);
    $scope.user = {};
    $scope.getUser = function () {
        if ($scope.userLoaded == false) {
            $scope.userLoaded = true;
            if (userid != -1) {
                $http.post('/api/wiki/models/user/getminiprofile', {
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
    $scope.unstar = function(name) {
        if (name && !$scope.loading && $scope.isOwner()) {
            $http.post("/api/wiki/models/user_stars/unstarproject", { name: name })
            .then(function (response) {
                if (response && response.data.success) {
                    $scope.projects = [];
                    $scope.loading = false;
                    $scope.getProjects();
                }
            })
        }
    }
    var getPageOffset = function () {
        return ($scope.currentPage - 1) * $scope.items_per_page;
    }
    $scope.getProjectsInPage = function () {
        var projs = [];
        for (var i = 0; i < $scope.items_per_page; i++) {
            var index = getPageOffset() + i;
            if (index < $scope.projects.length) {
                projs.push($scope.projects[index]);
            }
        }
        return projs;
    }
    // fetch single project on demand
    $scope.getProject = function (index) {
        index += getPageOffset();
        var proj = $scope.projects[index];
        if (proj && !proj.loaded && !proj.loading) {
            proj.loading = true;
            $http.post("/api/wiki/models/project/getminiproject", {
                name:proj.name
            }).then(function (response) {
                if (response.data) {
                    response.data.loaded = true;
                    angular.copy(response.data, proj);
                }
            }).catch(function (response) {
                console.log("error:" + response.data.message);
            });
        }
        return proj;
    }
    $scope.getProjects = function () {
        if ($scope.loading)
            return;
        $scope.loading = true;
        $http.post("/api/wiki/models/user_stars", {
            userid: userid != -1 ? userid : null,
        }).then(function (response) {
            if (response.data && response.data.stars) {
                var projects = response.data.stars.replace(/(,$)/g, "").split(",");
                if (projects) {
                    var projCount = projects.length;
                    for (var i = 0; i < projCount; i++) {
                        projects[i] = { name: projects[i], loaded: false };
                    }
                }
                $scope.projects = projects;
            }
            $scope.loading = false;
        }).catch(function (response) {
            console.log("error:" + response.data.message);
        });
    };
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
    Account.setRequireSignin(true);
});