angular.module('MyApp')
.factory('packagesInstallService', function () {
    var giturl = '';

    return {
        setGiturl : function(_giturl){
            this.giturl = _giturl;
        },
        getGiturl: function () {
            return this.giturl;
        }
    }
})
.controller('packagesInstallController', function ($scope, $http, $location, $uibModal, Account, packagesInstallService) {
    $scope.isadmin    = false;
    $scope.isVerified = null;

    $scope.$watch(Account.getUser, function (newValue, oldValue) {
        $scope.user = angular.copy(newValue);

        if ($scope.user != undefined && $scope.user.isadmin != undefined) {
            $scope.isadmin = eval($scope.user.isadmin);
        }
    });

    if ($location.path() == "/npl") {
        $scope.projectType = 'npl';
        $scope.myProjects = 'My npl packages';
    } else if ($location.path() == "/paracraft") {
        $scope.projectType = 'paracraft';
        $scope.myProjects = '我的paracraft模块';
    } else{
        $scope.projectType = '';
    }

    if($scope.projectType == 'npl'){
        $scope.authorDesc = 'Author';
        $scope.versionDesc = 'Version';
        $scope.updateDateDesc = 'Update date';
        $scope.installTimesDesc = 'Install times';
        $scope.installNow = 'Install now';
        $scope.download = 'Download';
        $scope.code = 'Github';
        $scope.verified = 'verified';
    }else if($scope.projectType == 'paracraft'){
        $scope.authorDesc = '创作者';
        $scope.versionDesc = '版本';
        $scope.updateDateDesc = '上次更新时间';
        $scope.installTimesDesc = '安装次数';
        $scope.installNow = '立即安装';
        $scope.download = '直接下载';
        $scope.code = '源码';
        $scope.verified = '已认证';
    }else{
        location.href="/wiki/mod/packages";
    }

    var request = $location.search();

    if (request.id != undefined && !isNaN(request.id)) {
        $http({
            method: 'POST',
            url: '/api/mod/packages/models/packages/getOnePackage',
            data: {
                packageId: request.id
            }
        })
        .then(function (response) {
            $scope.projectName     = response.data.projectName;
            $scope.projectDesc     = response.data.projectDesc;
            $scope.projectGitURL   = response.data.projectGitURL;
            $scope.projectReleases = response.data.projectReleases;
            $scope.projectUpdate   = response.data.projectUpdate;
            $scope.installTimes    = response.data.installTimes;
            $scope.version         = response.data.version;
            $scope.displayName     = response.data.displayName;
            $scope.isVerified      = eval(response.data.isVerified);

            $scope.getGit();
            //$scope.getPackageUserInfor(response.data.userId);
        },
        function (response) {

        });
    } else {
        return history.go(-1);
    }

    $scope.getPackageUserInfor = function (userId) {
        $http({
            method: 'POST',
            url: '/api/wiki/models/user/getminiprofile',
            data: { '_id': userId }
        })
        .then(function (response) {
            $scope.displayName = response.data.displayName;
        }, function (response) { })
    }

    var md;
    $scope.getMarkDownRenderer = function () {
        if (md == null) {
            md = window.markdownit({
                html: true, // Enable HTML tags in source
                linkify: true, // Autoconvert URL-like text to links
                typographer: true, // Enable some language-neutral replacement + quotes beautification
                breaks: false,        // Convert '\n' in paragraphs into <br>
                highlight: function (str, lang) {
                    if (lang && window.hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(lang, str, true).value;
                        } catch (__) { }
                    }
                    return ''; // use external default escaping
                }
            });
        }
        return md;
    }

    $scope.getGit = function () {
        var gitRaw = "https://raw.githubusercontent.com";

        try {
            var gitRoot = $scope.projectGitURL.split("//");
            var gitRootStart = gitRoot[1].indexOf("/");
            var gitRoot = gitRaw + gitRoot[1].substring(gitRootStart);
        } catch (err) {
            return alert("url format error");
        }

        $scope.gitIcon = gitRoot + '/master/icon.png'

        var getREADME = gitRoot + '/master/README.md'

        $http({
            method: 'GET',
            url: getREADME,
            headers: {
                'Authorization': undefined,
            }, // remove auth header for this request
            skipAuthorization: true, // this is added by our satellizer module, so disable it for cross site requests.
            transformResponse: [function (data) {
                return data; // never transform to json, return as it is
            }],
        })
        .then(function (response) {
            var html = $scope.getMarkDownRenderer().render(response.data);
            $('.install-wiki').html(html);
        },
        function (response) {
            return alert("You need to upload README.md in your git repositary");
        });
    }

    // if (packagesPageService.getPageName() == 'npl') {
    //     $scope.projectType = "a"
    // } else if (packagesPageService.getPageName() == 'paracraft') {
    //     $scope.projectType = "b";
    // }

    $scope.downloadCountAndOpen = function () {
        $http({
            method: "POST",
            url: '/api/mod/packages/models/packages/download',
            data: {
                packageId: request.id,
                projectType: $scope.projectType
            }
        })
        .then(function (response) {
            if (response.data.result == 1) {
                window.location.href = $scope.projectReleases;
            }
        }, function (response) { });
        return false;
    }

    $scope.install = function () {
        $http(
            {
                method: 'GET',
                url: 'http://127.0.0.1:8099/localInstall#?giturl=' + $scope.projectGitURL,
                headers: {
                    'Authorization': undefined,
                }, // remove auth header for this request
                skipAuthorization: true, // this is added by our satellizer module, so disable it for cross site requests.
            }
        )
        .then(function (response) {
            $http({
                method: "POST",
                url: '/api/mod/packages/models/packages/download',
                data: {
                    packageId: request.id,
                    projectType: $scope.projectType
                }
            })
            .then(function (response) {
                if (response.data.result == 1) {
                    packagesInstallService.setGiturl(
                        '127.0.0.1:8099/localInstall#?'
                        + 'projectReleases=' + encodeURIComponent($scope.projectReleases)
                        + '&gitIcon=' + encodeURIComponent($scope.gitIcon)
                        + '&projectName=' + encodeURIComponent($scope.projectName)
                        + '&displayName=' + encodeURIComponent($scope.displayName)
                        + '&version=' + encodeURIComponent($scope.version)
                        + '&packagesId=' + encodeURIComponent(request.id)
                        + '&projectType=' + encodeURIComponent($scope.projectType)
                        + '&homepage=' + encodeURIComponent(window.location.href)
                    );

                    $uibModal.open({
                        templateUrl: MOD_WEBROOT + "partials/local_install_dialog.html",
                        controller: 'localInstallDialogController',
                        size: 'lg'
                    }).result.then(function (params) {
                        //alert(params);
                    }, function (params) { })
                }
            }, function (response) { });
        }, function (response) {
            alert("`直接安装`需要您启动Paracraft客户端并打开`Mod加载`界面，但是没有检测到正在运行的Paracraft客户端, 请`直接下载`或启动后重试");
        });
    }

    $scope.$watch('isVerified', function (newValue, oldValue) {

        if (oldValue != null && newValue != oldValue) {

            $http({
                method: "POST",
                url: "/api/mod/packages/models/packages/verifyPackages",
                data: {
                    "packagesId": request.id,
                    "isVerified": newValue.toString()
                }
            })
            .then(function (response) {
                if (response.data.error == -1) {
                    $scope.isVerified = oldValue;
                };
            }).then(function (response) { });
        }

    });
})
.controller('localInstallDialogController', function ($scope, packagesInstallService, $sce, $uibModalInstance) {
    var url = packagesInstallService.getGiturl();

    $scope.giturl = $sce.trustAsResourceUrl("http://" + url);

    $scope.close = function () {
        $uibModalInstance.close();
    }
});