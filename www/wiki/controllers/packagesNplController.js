angular.module('MyApp')
.controller('packagesNplController', function ($scope, $http) {
    $scope.packages = [];
    $scope.packagesStats = 0;
    $scope.dayDownload   = 0;
    $scope.monthDownload = 0;
    $scope.yearDownload  = 0;

    //packagestats
    $http({
        method: 'POST',
        url: '/api/wiki/models/packages/getStats',
        data: { statsType: "packageStats" }
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
        data: { statsType: "dayDownload" }
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
        data: { statsType: "monthDownload" }
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
        data: { statsType: "yearDownload" }
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
            projectType: "a",
            top: 20 
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