angular.module('plugin', ['ui.bootstrap'])
.controller('localInstallController', function ($scope, $http, $location) {
    var params = $location.search();

    $scope.projectName = params.projectName;
    $scope.version = params.version;
    $scope.author = params.displayName;

    $scope.install = function () {
        $http({
            method: 'POST',
            url: '/ajax/localInstall?action=downloadzip',
            data: {
                url: 'https://github.com/onedou/DOC/archive/master.zip',
            }
        })
        .then(function (response) {

            var lock = true;

            if (lock) {
                alert("Some packages is downing,please wait it finish");

            } else {
                $scope.packageTotal = 0;

                $(".start").text("0% 0/" + $scope.packageTotal + " KB").attr("disabled", "disabled");
                $(".process").css({ "display": "block", "width": "0%" });

                $scope.getCurrentDownload();
            }

        }, function (response) { });
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

    //$scope.install = function () {
    //    $http({
    //            method: 'GET',
    //            url: 'https://github.com/onedou/DOC/archive/master.zip',
    //            headers: {
    //                'Authorization': undefined,
    //            }, // remove auth header for this request
    //            skipAuthorization: true, // this is added by our satellizer module, so disable it for cross site requests.
    //    })
    //    .then(function (response) {
    //        console.log(response);
    //    },
    //    function (response) { })
    //}
})