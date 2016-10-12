angular.module('plugin', ['ui.bootstrap'])
.controller('localInstallController', function ($scope, $http, $location) {
    var params = $location.search();

    $scope.projectName = params.projectName;
    $scope.version = params.version;
    $scope.author = params.displayName;

    $scope.install = function () {
        $(".start").text("");
        $(".process").css({ "display": "block" ,"width":"1%"});

        //$http({
        //    method: 'POST',
        //    url: '/ajax/localInstall?action=downloadzip',
        //    data: {
        //        url: 'https://github.com/onedou/DOC/archive/master.zip',
        //    }
        //})
        //.then(function (response) {
            
        //    $(".process").text("Download complete!")

        //    setTimeout(function () {
        //        //alert("安装完成:)，请关闭对话框");
        //    }, 1000);

        //    console.log(response);
        //}, function (response) { });
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