define([
    'app',
    'text!mod/packages/html/index.html',
], function (app, htmlContent) {
    app.controller('packagesController', ["$scope" , "$http" , "$location" , "$rootScope" , function ($scope, $http, $location, $rootScope) {
        $scope.packages      = [];
        $scope.packagesStats = 0;
        $scope.dayDownload   = 0;
        $scope.monthDownload = 0;
        $scope.yearDownload  = 0;

        var path = window.location.pathname;
        path = path.replace("/wiki/mod/packages/index", "");

        if (path == "/npl") {
            $scope.projectType = 'npl';
        } else if (path == "/paracraft") {
            $scope.projectType = 'paracraft';
        } else {
            $scope.projectType = 'paracraft';
        }

        function loadPackage() {
            //packagestats
            $http({
                method: 'POST',
                url: '/api/mod/packages/models/packages/getPackagesStats',
                data: {
                    statsType: "packageStats",
                    projectType: $scope.projectType
                }
            }).then(function (response) {
                if (response.data.statsType != 'nil') {
                    $scope.packagesStats = response.data.quantity;
                } else {
                    alert(response.data.msg);
                }
            }, function (response) {});

            //daydownload
            $http({
                method: 'POST',
                url: '/api/mod/packages/models/packages/getDownloadStats',
                data: {
                    getType: "day",
                    projectType: $scope.projectType
                }
            }).then(function (response) {
                if (response.data.statsType != 'nil') {
                    $scope.dayDownload = response.data.quantity;
                }
            }, function (response) {});

            //monthdownload
            $http({
                method: 'POST',
                url: '/api/mod/packages/models/packages/getDownloadStats',
                data: {
                    getType: "month",
                    projectType: $scope.projectType
                }
            }).then(function (response) {
                if (response.data.statsType != 'nil') {
                    $scope.monthDownload = response.data.quantity;
                }
            }, function (response) {});

            //yeardownload
            $http({
                method: 'POST',
                url: '/api/mod/packages/models/packages/getDownloadStats',
                data: {
                    getType: "year",
                    projectType: $scope.projectType
                }
            }).then(function (response) {
                if (response.data.statsType != 'nil') {
                    $scope.yearDownload = response.data.quantity;
                }
            }, function (response) {});

            //get top20 packages
            $http({
                method: 'POST',
                url: '/api/mod/packages/models/packages',
                data: {
                    projectType: $scope.projectType,
                    userid: -1,
                    amount: 20
                }
            }).then(function (response) {
                $scope.packages = response.data;

                for (index in $scope.packages) {
                    var gitRaw = "https://raw.githubusercontent.com";

                    try {
                        var gitRoot = $scope.packages[index].projectGitURL.split("//");
                        var gitRootStart = gitRoot[1].indexOf("/");
                        var gitRoot = gitRaw + gitRoot[1].substring(gitRootStart);
                    } catch (err) {
                        // console.log("url format error");
                        return;
                    }

                    var gitIcon = gitRoot + '/master/icon.png'

                    $scope.packages[index].gitIcon = gitIcon;
                }

            }, function (response) {});
        }

        //$rootScope.$on('$locationChangeSuccess', function () {
        //    loadPackage();
        //});

        $scope.setPage = function (page) {
            if (page == "npl") {
                location.href = "/wiki/mod/packages/index/npl";
            } else if (page == "paracraft") {
                location.href = "/wiki/mod/packages/index/paracraft";
            }
        }

        function init() {
            loadPackage();
        }

        init();
    }]);

    return htmlContent;
});