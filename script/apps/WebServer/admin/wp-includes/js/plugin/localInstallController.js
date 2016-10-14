angular.module('plugin', ['ui.bootstrap'])
.controller('localInstallController', function ($scope, $http, $location, $interval,$timeout) {
    var params = $location.search();

    $scope.projectName = params.projectName;
    $scope.version = params.version;
    $scope.author = params.displayName;
    $scope.giturl = params.giturl;

    $scope.seconds = 5;

    $interval(function () {
        $scope.seconds--;
    },1000,5)

    $timeout(function () {
        $scope.install();
        $(".start").text("Starting......");
    }, 5000);

    $scope.install = function () {
        $http({
            method: 'POST',
            url: '/ajax/localInstall?action=downloadQueue',
            data: {
                url: $scope.giturl,
            }
        })
        .then(function (response) {
 
            if (response.data.waitCount == 0) {
                if (response.data.status == 1) {
                    $scope.startDownload();
                } else {
                    $(".start").text("packages is not update");
                    $(".button span").css("display", "block");
                }

            } else {
                if (response.data.isYourTurn == 1) {
                    $scope.startDownload();
                } else if (response.data.isYourTurn == 0) {
                    $timeout(function () {
                        $scope.install();
                    }, 1000);
                } else {
                    return alert("status error!");
                }
            }

        }, function (response) { });
    }

    $scope.startDownload = function(){
        $http({
            method: 'POST',
            url: '/ajax/localInstall?action=downloadzip',
            data: {
                url: $scope.giturl,
            }
        })
        .then(function (response) {

            if (response.data.status) {
                $scope.getCurrentDownload();
            } else {
                return alert("error status!");
            }

        }, function () { });
    }

    $scope.getCurrentDownload = function () {
        $http({
            method: "GET",
            url: "/ajax/localInstall?action=GetCurrentDownload",
            data: {

            }
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

                $(".start").text(percent + "%" + currentFileSize + "/" + totalFileSize + " KB");
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