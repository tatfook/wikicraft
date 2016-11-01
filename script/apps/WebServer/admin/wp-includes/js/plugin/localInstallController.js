angular.module('plugin', ['ui.bootstrap'])
.controller('localInstallController', function ($scope, $http, $location, $interval,$timeout) {
    var params = $location.search();

    $scope.projectName = params.projectName;
    $scope.version = params.version;
    $scope.author = params.displayName;
    $scope.projectReleases = params.projectReleases;
    $scope.gitIcon = params.gitIcon;
    $scope.packagesId = params.packagesId;

    $scope.seconds = 5;
    $scope.currentProjectName = 'Not yet!';
    $scope.waitPackagesIsEmpty = true;
    $scope.waitPackages = [];

    $interval(function () {
        $scope.seconds--;
    },1000,5);

    $timeout(function () {
        $scope.install();
        $(".start").text("Starting......");
    }, 5000);

    $scope.install = function () {
        $http({
            method: 'POST',
            url: '/ajax/localInstall?action=downloadQueue',
            data: {
                url: $scope.projectReleases,
                projectName: $scope.projectName,
                packagesId: $scope.packagesId
            }
        })
        .then(function (response) {
            if (response.data.lock == 1) {
                $timeout(function () {
                    $scope.install();
                }, 1000);
                return;
            }

            $scope.currentProjectName = response.data.currentProjectName;

            for (var i in response.data.waitPackages) {
                $scope.waitPackagesIsEmpty = false;
                break;
            }
            
            if (!$scope.waitPackagesIsEmpty) {
                $scope.waitPackages = response.data.waitPackages;
            }

            if (response.data.isYourTurn == 1) {
                if (response.data.status == 1) {
                    $scope.getCurrentDownload();
                } else if (response.data.status == 0) {
                    $(".start").text("packages is not update");
                    $(".button span").css("display", "block");
                } else if (response.data.status == -1) {
                    $(".start").text("service is not available now,please try again later");
                    $(".button span").css("display", "block");
                    
                    if(confirm("reply?")){
                        $scope.install()
                    }
                }

            } else if (response.data.currentPackagesId == $scope.packagesId) {
                $scope.getCurrentDownload();
                //alert('continue');
            } else if (response.data.isYourTurn == 0) {
                console.log(response.data);

                $timeout(function () {
                    $scope.install();
                }, 1000);
            } else {
                return alert("error!");
            }

        }, function (response) { });
    }

    $scope.getCurrentDownload = function () {
        $http({
            method: "GET",
            url: "/ajax/localInstall?action=GetCurrentDownload",
            data: {}
        })
        .then(function (response) {
            if (response.data.status == -1 || response.data.status == 0) {

                var currentFileSize = response.data.currentFileSize;
                var totalFileSize   = response.data.totalFileSize;

                var percent = (currentFileSize / totalFileSize) * 100;

                //console.log(currentFileSize, totalFileSize, percent)

                if (isNaN(percent) || percent == Infinity) {
                    percent = 0;
                } else {
                    percent = parseInt(percent);
                }

                //console.log(currentFileSize, totalFileSize, percent);

                $(".start").text(percent + "%      " + parseInt(currentFileSize / 1024) + "/" + parseInt(totalFileSize / 1024) + " KB");
                $(".process").css({ "display": "block", "width": percent + "%" });

                $timeout(function () {
                    $scope.getCurrentDownload();
                }, 1000);
                
            } else if (response.data.status == 1) {

                $(".start").text("Download complete!").css("background-color", "#00ffbd");
                $(".process").css({ "opacity": "0", "width": "100%" });
                $(".button span").css("display", "block");

            } else {
                return alert("error status!");
            }

        }, function (response) { });

    }
})