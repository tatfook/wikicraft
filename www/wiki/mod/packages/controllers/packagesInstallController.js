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
.controller('packagesInstallController', function ($scope, $http, $location, $uibModal, Account, packagesPageService, packagesInstallService) {
    $scope.isadmin    = false;
    $scope.isVerified = null;

    $scope.$watch(Account.getUser, function (newValue, oldValue) {
        $scope.user = angular.copy(newValue);

        if ($scope.user != undefined && $scope.user.isadmin != undefined) {
            $scope.isadmin = eval($scope.user.isadmin);
        }
    });

    var absUrl = $location.absUrl();

    function UrlSearch() {
        var name, value;
        var str = location.href; //取得整个地址栏
        var num = str.indexOf("?");
        str = str.substr(num + 1); //取得所有参数   stringvar.substr(start [, length ]

        var arr = str.split("&"); //各个参数放到数组里
        for (var i = 0; i < arr.length; i++) {
            num = arr[i].indexOf("=");
            if (num > 0) {
                name = arr[i].substring(0, num);
                value = arr[i].substr(num + 1);
                this[name] = value;
            }
        }
    }

    var Request = new UrlSearch();

    if (Request.id != undefined && !isNaN(Request.id)) {
        $http({
            method: 'POST',
            url: '/api/mod/packages/models/packages/getOnePackage',
            data: {
                packageId: Request.id
            }
        })
        .then(function (response) {
            $scope.projectName   = response.data.projectName;
            $scope.projectDesc   = response.data.projectDesc;
            $scope.projectGitURL = response.data.projectGitURL;
            $scope.projectUpdate = response.data.projectUpdate;
            $scope.installTimes  = response.data.installTimes;
            $scope.version       = response.data.version;
            $scope.displayName   = response.data.displayName;
            $scope.isVerified    = eval(response.data.isVerified);

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

    $scope.addFavorite = function () {
        var url = window.location;
        var title = document.title;
        var ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf("360se") > -1) {
            alert("由于360浏览器功能限制，请按 Ctrl+D 手动收藏！");
        }
        else if (ua.indexOf("msie 8") > -1) {
            window.external.AddToFavoritesBar(url, title); //IE8
        }
        else if (document.all) {
            try {
                window.external.addFavorite(url, title);
            } catch (e) {
                alert('您的浏览器不支持,请按 Ctrl+D 手动收藏!');
            }
        }
        else if (window.sidebar) {
            window.sidebar.addPanel(title, url, "");
        }
        else {
            alert('您的浏览器不支持,请按 Ctrl+D 手动收藏!');
        }
    }

    if (packagesPageService.getPageName() == 'npl') {
        $scope.projectType = "a"
    } else if (packagesPageService.getPageName() == 'paracraft') {
        $scope.projectType = "b";
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
                    packageId: Request.id,
                    projectType: $scope.projectType
                }
            })
            .then(function (response) {
                if (response.data.result == 1) {
                    packagesInstallService.setGiturl(
                        '127.0.0.1:8099/localInstall#?'
                        + 'giturl='      + $scope.projectGitURL
                        + '&projectName=' + $scope.projectName
                        + '&displayName=' + $scope.displayName
                        + '&version=' + $scope.version
                        + '&packagesId=' + Request.id
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
            alert("local service is not start");
        });
    }

    $scope.$watch('isVerified', function (newValue, oldValue) {

        if (oldValue != null && newValue != oldValue) {

            $http({
                method: "POST",
                url: "/api/mod/packages/models/packages/verifyPackages",
                data: {
                    "packagesId": Request.id,
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