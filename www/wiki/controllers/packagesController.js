angular.module('MyApp')
.controller('packagesController', function ($scope, $http, packagesPageService) {
    $scope.packages = [];
    $scope.packagesStats = 0;
    $scope.dayDownload   = 0;
    $scope.monthDownload = 0;
    $scope.yearDownload = 0;

    var projectType = packagesPageService.getPageName() == 'npl'?"a":"b";

    //packagestats
    $http({
        method: 'POST',
        url: '/api/wiki/models/packages/getStats',
        data: {
            statsType: "packageStats",
            projectType: projectType
        }
    })
    .then(function (response) {
        if (response.data.statsType != 'nil') {
            $scope.packagesStats = response.data.quantity;
        }
    }, function (response) { });

    //daydownload
    $http({
        method: 'POST',
        url: '/api/wiki/models/packages/getStats',
        data: {
            statsType: "dayDownload",
            projectType: projectType
        }
    })
    .then(function (response) {
        if (response.data.statsType != 'nil') {
            $scope.dayDownload = response.data.quantity;
        }
    }, function (response) { });

    //monthdownload
    $http({
        method: 'POST',
        url: '/api/wiki/models/packages/getStats',
        data: {
            statsType: "monthDownload",
            projectType: projectType
        }
    })
    .then(function (response) {
        if (response.data.statsType != 'nil') {
            $scope.monthDownload = response.data.quantity;
        }
    }, function (response) { });

    //yeardownload
    $http({
        method: 'POST',
        url: '/api/wiki/models/packages/getStats',
        data: {
            statsType: "yearDownload",
            projectType: projectType
        }
    })
    .then(function (response) {
        if (response.data.statsType != 'nil') {
            $scope.yearDownload = response.data.quantity;
        }
    }, function (response) { });

    //get top20 packages
    $http({
        method: 'POST',
        url: '/api/wiki/models/packages',
        data: {
            projectType: projectType,
            amount: 20 
        }
    })
    .then(function (response) {
        $scope.packages = response.data;

        for (index in $scope.packages) {
            var gitRaw = "https://raw.githubusercontent.com";

            try {
                var gitRoot = $scope.packages[index].projectGitURL.split("//");
                var gitRootStart = gitRoot[1].indexOf("/");
                var gitRoot = gitRaw + gitRoot[1].substring(gitRootStart);
            } catch (err) {
                return alert("url format error");
            }

            var gitIcon = gitRoot + '/master/icon.png'

            $scope.packages[index].gitIcon = gitIcon;
        }

    }, function (response) { });
})