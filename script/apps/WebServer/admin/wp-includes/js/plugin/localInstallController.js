angular.module('plugin', ['ui.bootstrap'])
.controller('localInstallController', function ($scope, $http,$location)
{
    var params = $location.search();

    $scope.projectName = params.projectName;
    $scope.version     = params.version;
    $scope.author      = params.displayName;

    $scope.install = function () {
        $http({
            method: 'POST',
            url: '/ajax/localInstall?action=downloadzip',
            data: {
                url: 'https://github.com/onedou/DOC/archive/master.zip',
            }
        })
        .then(function (response) {
            console.log(response);
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