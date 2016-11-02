angular.module('MyApp')
.controller('packagesController', function ($scope, $http, $location) {
    $scope.packages = [];
    $scope.packagesStats = 0;
    $scope.dayDownload   = 0;
    $scope.monthDownload = 0;
    $scope.yearDownload  = 0;

    if ($location.url() == "/npl") {
        $scope.projectType = 'npl';
    } else if ($location.url() == "/paracraft") {
        $scope.projectType = 'paracraft';
    } else {
        $scope.projectType = 'npl';
    }

    // var pageName = packagesPageService.getPageName();
    // var projectType = pageName == 'npl' ? "a" : "b";

    //packagestats
    $http({
        method: 'POST',
        url: '/api/mod/packages/models/packages/getPackagesStats',
        data: {
            statsType: "packageStats",
            projectType: $scope.projectType
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
        url: '/api/mod/packages/models/packages/getDownloadStats',
        data: {
            getType: "day",
            projectType: $scope.projectType
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
        url: '/api/mod/packages/models/packages/getDownloadStats',
        data: {
            getType: "month",
            projectType: $scope.projectType
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
        url: '/api/mod/packages/models/packages/getDownloadStats',
        data: {
            getType: "year",
            projectType: $scope.projectType
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
        url: '/api/mod/packages/models/packages',
        data: {
            projectType: $scope.projectType,
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