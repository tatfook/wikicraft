angular.module('plugin', ['ui.bootstrap'])
.controller('localInstallController', function ($scope, $http, $location, $interval,$timeout) {
    var params = $location.search();

    $scope.projectName = params.projectName;
    $scope.version = params.version;
    $scope.author = params.displayName;
    $scope.projectReleases = params.projectReleases;
    $scope.gitIcon = params.gitIcon;
    $scope.packagesId = params.packagesId;
    $scope.projectType = params.projectType;

    $scope.seconds = 5;
    $scope.waitPackagesIsEmpty = true;
    $scope.waitPackages = [];

    $scope.language = {};

    var language_chinese = {
        "starting":"开始中",
        "notUpdate":"软件包未有更新",
        "serviceNotAvailable":"网络似乎出现了一些问题，请稍后再试",
        "complete":"完成！",
        "packageNameDesc":"项目名称",
        "authorDesc":"作者",
        "versionDesc":"版本",
        "thanks":"谢谢你的下载",
        "current":"当前下载",
        "waiting":"正在下载",
        "projectNameDesc":"项目名称",
        "packageId":"包ID",
        "notYet":"还没有！",
        "countDownA":"",
        "countDownB":"秒后开始",
        "tryAgain":"请按右上角的按钮关闭对话框",
        "reply":"重试？"
    };

    var language_english = {
        "starting":"Staring",
        "notUpdate":"packages is not update",
        "serviceNotAvailable":"service is not available now,please try again later",
        "complete":"Download complete!",
        "packageNameDesc":"Package name",
        "authorDesc":"Author",
        "versionDesc":"version",
        "thanks":"Thanks for download.",
        "current":"Current download",
        "waiting":"Waiting download packages",
        "projectNameDesc":"Project name",
        "packageId":"Package id",
        "notYet":"Not yet!",
        "countDownA":"After ",
        "countDownB":"s will start",
        "tryAgain":"Press close button at right top corner",
        "reply":"reply?"
    };

    if($scope.projectType == 'npl'){
        $scope.language = language_english;
    }else if($scope.projectType == 'paracraft'){
        $scope.language = language_chinese;
    }

    $interval(function () {
        $scope.seconds--;
    },1000,5);

    $timeout(function () {
        $scope.install();
        $(".start").text($scope.language.starting+"......");
    }, 5000);

    $scope.install = function () {
        $http({
            method: 'POST',
            url: '/ajax/localInstall?action=downloadQueue',
            data: {
                url: $scope.projectReleases,
                projectName: $scope.projectName,
                packagesId: $scope.packagesId,
                projectType: $scope.projectType
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
                    $(".start").text($scope.language.notUpdate);
                    $(".button span").css("display", "block");
                } else if (response.data.status == -1) {
                    $(".start").text($scope.language.serviceNotAvailable);
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

                $(".start").text($scope.language.complete).css("background-color", "#00ffbd");
                $(".process").css({ "opacity": "0", "width": "100%" });
                $(".button span").css("display", "block");

            } else {
                return alert("error status!");
            }

        }, function (response) { });

    }
})