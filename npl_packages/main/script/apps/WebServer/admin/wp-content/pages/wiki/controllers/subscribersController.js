angular.module('MyApp')
.controller('SubscribersCtrl', function ($scope, $http, Account, WikiPage) {
    $scope.users = [];
    $scope.loading = false;
    $scope.currentPage = 1;
    $scope.items_per_page = 3*8;
    $scope.getSiteName = function () {
        return WikiPage.getSiteName();
    }
    $scope.isMeStared = function () {
        return WikiPage.isStared();
    }
    var getPageOffset = function() {
        return ($scope.currentPage - 1) * $scope.items_per_page;
    }
    $scope.getUsersInPage = function() {
        var users = [];
        for (var i = 0; i < $scope.items_per_page; i++) {
            var index = getPageOffset() + i;
            if (index < $scope.users.length) {
                users.push($scope.users[index]);
            }
        }
        return users;
    }
    $scope.getUsers = function () {
        if ($scope.loading)
            return;
        $scope.loading = true;
        $http.post("/api/wiki/models/project_stars", {
            name: $scope.getSiteName(),
        }).then(function (response) {
            if (response.data && response.data.stars) {
                var users = response.data.stars.replace(/(,$)/g, "").split(",");
                if(users) {
                    var userCount = users.length;
                    for (var i = 0; i < userCount; i++) {
                        users[i] = { _id: users[i], loaded:false };
                    }
                }
                $scope.users = users;
                if ($scope.user && $scope.isMeStared()) {
                    $scope.moveUserToFront($scope.user);
                }
            }
            $scope.loading = false;
        }).catch(function (response) {
            console.log("error:" + response.data.message);
        });
    };
    $scope.getUser = function (index) {
        index = index + getPageOffset();
        var user = $scope.users[index];
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
    $scope.$watch(Account.isAuthenticated, function (bAuthenticated) {
        if (bAuthenticated) {
            $scope.getUsers();
        } else {
            $scope.users = [];
        }
    });
    $scope.moveUserToFront = function(user) {
        if (user) {
            for (var i = 0; i < $scope.users.length; i++) {
                if ($scope.users[i]._id == user._id) {
                    if (i != 0) {
                        $scope.users[i] = $scope.users[0];
                    }
                    $scope.users[0] = user;
                    return;
                }
            }
            $scope.users.splice(0, 0, user);
        }
    }
    $scope.$on('onUserProfile', function (event, user) {
        if ($scope.isMeStared()) {
            $scope.moveUserToFront(user);
        }
        $scope.user = user;
    });
    Account.setRequireSignin(true);
});