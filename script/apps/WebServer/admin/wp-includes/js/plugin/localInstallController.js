angular.module('plugin', ['ui.bootstrap'])
.controller('localInstallController', function ($scope, $http, $location, $interval,$timeout) {
    var params = $location.search();

    $scope.projectName = params.projectName;
    $scope.version = params.version;
    $scope.author = params.displayName;
    $scope.giturl = params.giturl;

    $scope.seconds = 5;
    //var countDownInterval = setInterval(function () {
    //    //$scope.seconds = $scope.seconds-1;
    //    console.log($scope.seconds);
    //}, 1000);

    $interval(function () {
        $scope.seconds--;
        //console.log($scope.seconds);
    },1000,5)

    $timeout(function () {
        $scope.install();
        $(".start").text("Starting......");
    }, 5000);

    $scope.install = function () {
        $http({
            method: 'POST',
            url: '/ajax/localInstall?action=getDownloadQueue',
            data: {
                url: $scope.giturl,
            }
        })
        .then(function (response) {
 
            if (response.data.waitCount == 0) {
                $scope.startDownload();
            } else {
                if (response.data.isYourTurn == 1) {
                    $scope.startDownload();
                } else {
                    $timeout(function () {
                        $scope.install();
                    }, 1000);
                }
            }

            //var lock = true;

            //if (lock) {
            //    alert("Some packages is downing,please wait it finish");

            //} else {
            //    $scope.packageTotal = 0;

            //    $(".start").text("0% 0/" + $scope.packageTotal + " KB").attr("disabled", "disabled");
            //    $(".process").css({ "display": "block", "width": "0%" });

            //    $scope.getCurrentDownload();
            //}

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
        .then(function () {

        }, function () { });
    }

    $scope.getCurrentDownload = function () {
        $http({
            method: "GET",
            url: "",
            data: {

            }
        })
        .then(function (response) {
            var status = '';
            var currentTotal = 0;

            var percent = currentTotal/$scope.packageTotal*100;

            if (status == 'complete') {
                $(".start").text("Download complete!").css("background-color", "#00ffbd");
                $(".process").css({ "opacity": "0", "width": percent+"%" });
                $(".button span").css("display", "block");
            } else {
                $(".start").text(percent + "%" + currentTotal + "/" + $scope.packageTotal + " KB");
                $(".process").css({ "display": "block", "width": percent + "%" });
            }

        }, function (response) { });

    }
})