/**
Author: LiXizhi@yeah.net
Date: 2016.9.6
*/
angular.module('MyApp')
.controller('statsController', function ($scope, $http, $location, Account) {
    $scope.siteinfo = {};

    $scope.currentProjPage = 1;
    $scope.projs_per_page = 12;
    $scope.recent_projects = [];

    $scope.currentUserPage = 1;
    $scope.users_per_page = 12;
    $scope.recent_users = [];

    $scope.lastmodified_projects = []; // TODO

    $scope.loading = false;
    
    $scope.getSiteInfo = function () {
        if ($scope.loading)
            return;
        $scope.loading = true;
        $http.post("/api/wiki/models/stats", {
            name: "siteinfo",
        }).then(function (response) {
            if (response.data && response.data.datatable) {
                $scope.siteinfo = response.data.datatable;
            }
            $scope.loading = false;
            $scope.fetchRecentProjects();
        }).catch(function (response) {
            console.log("error:" + response.data.message);
        });
    };
    var getPageOffset = function () {
        return ($scope.currentProjPage - 1) * $scope.projs_per_page;
    }
    // fetch single project on demand
    $scope.getProject = function (index) {
        index += getPageOffset();
        var proj = $scope.recent_projects[index];
        if (proj && !proj.loaded && !proj.loading) {
            proj.loading = true;
            $http.post("/api/wiki/models/project/getminiproject", {
                name: proj.name
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
    var projLoaded = false;
    $scope.fetchRecentProjects = function () {
        if ($scope.loading)
            return;
        $scope.loading = true;
        $http.post("/api/wiki/models/stats", {
            name: "recent_projects",
        }).then(function (response) {
            if (response.data && response.data.datatable) {
                var projects = response.data.datatable;
                var projCount = projects.length;
                for (var i = 0; i < projCount; i++) {
                    projects[i] = { name: projects[i], loaded: false };
                }
                $scope.recent_projects = response.data.datatable;
            }
            $scope.loading = false;
            $scope.fetchRecentUsers();
        }).catch(function (response) {
            console.log("error:" + response.data.message);
        });
    };
    var getUserPageOffset = function () {
        return ($scope.currentUserPage - 1) * $scope.users_per_page;
    }
    $scope.getUser = function (index) {
        index = index + getUserPageOffset();
        var user = $scope.recent_users[index];
        if (user && !user.loaded && !user.loading) {
            user.loading = true;
            $http.post("/api/wiki/models/user/getminiprofile", {
                _id: user._id
            }).then(function (response) {
                if (response.data) {
                    response.data.loaded = true;
                    angular.copy(response.data, user);
                }
            }).catch(function (response) {
                console.log("error:" + response.data.message);
            });
        }
        return user;
    };
    $scope.fetchRecentUsers = function () {
        if ($scope.loading)
            return;
        $scope.loading = true;
        $http.post("/api/wiki/models/stats", {
            name: "recent_users",
        }).then(function (response) {
            if (response.data && response.data.datatable) {
                var users = response.data.datatable;
                var userCount = users.length;
                for (var i = 0; i < userCount; i++) {
                    users[i] = { _id: users[i], loaded: false };
                }
                $scope.recent_users = users;
            }
            $scope.loading = false;
        }).catch(function (response) {
            console.log("error:" + response.data.message);
        });
    };

    $scope.getSiteInfo();
});