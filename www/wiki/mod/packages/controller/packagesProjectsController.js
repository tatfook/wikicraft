define([
    'app',
    'text!mod/packages/html/packages_projects.html'
], function (app, htmlContent) {
    app.factory('packagesService', [function () {
        var packageId = 0;
        var page = 1;
        var projectsType = "";
        var forceUpdatePagin = 0;

        return {
            getModifyPackageId: function () {
                return packageId;
            },
            setModifyPackageID: function (_packageId) {
                packageId = _packageId;
            },
            getPage: function () {
                return page;
            },
            setPage: function (_page) {
                page = _page;
            },
            getProjectsType: function () {
                return projectsType;
            },
            setProjectsType: function (_projectsType) {
                projectsType = _projectsType;
            },
            getForceUpdatePagin: function () {
                return forceUpdatePagin;
            },
            setForceUpdatePagin: function (_forceUpdatePagin) {
                forceUpdatePagin = _forceUpdatePagin;
            }
        };
    }])
    .controller('packagesProjectsController', ["$scope" , "$uibModal" , "$http" , "Account" , "packagesService" , "$location" , "$rootScope" , function ($scope, $uibModal, $http, Account, packagesService, $location, $rootScope) {
        var params  = window.location.search.replace("?", "").split("&");
        var request = {};
        
        for (var i in params) {
            var param = params[i].split("=");
            request[param[0]] = param[1];
        }

        if (request.userid == undefined) {
            Account.ensureAuthenticated();

        } else {
            $scope.othersMode = true;
        }

        var path = window.location.pathname;
        path = path.replace("/wiki/mod/packages/packages_projects", "");

        if (path == "/npl") {
            $scope.projectType = 'npl';
        } else if (path == "/paracraft") {
            $scope.projectType = 'paracraft';
        } else {
            $scope.projectType = 'paracraft';
        }

        if ($scope.projectType == 'npl') {
            $scope.editProfile = 'Edit profile';
            $scope.create      = 'Create';
            $scope.myProjects  = 'My npl packages';
            $scope.downloadsA  = 'Downloads:';
            $scope.downloadsB  = '';
            $scope.deleteDesc  = "Are you sure delete this project?";
        } else if ($scope.projectType == 'paracraft') {
            $scope.editProfile = '个人设置';
            $scope.create      = '新建';
            $scope.myProjects  = '我的paracraft模块';
            $scope.downloadsA  = '下载次数';
            $scope.downloadsB  = '次';
            $scope.deleteDesc  = "是否确定删除你的项目？";
        }

        packagesService.setProjectsType($scope.projectType);

        $scope.ShowCreateProjectDialog = function () {
            $uibModal.open({
                templateUrl: '/wiki/mod/packages/partials/packages_project_create.html',
                controller:  "packagesProjectsCreateController",
                size: 'lg'
            }).result.then(function (params) {
                alert(params.msg);
                if ($scope.projectType == params.projectType) {
                    packagesService.setForceUpdatePagin(1);
                } else {
                    $scope.projectType = params.projectType;
                    packagesService.setProjectsType($scope.projectType);
                }

                $scope.getProjects();
            }, function (text, error) {});
        };

        if (request.userid == undefined) {
            $scope.$on("onUserProfile", function (event, user) {
                $scope.user = angular.copy(user);
            });
        } else {
            $http({
                method: 'POST',
                url: '/api/wiki/models/user/getminiprofile',
                data: { "_id": request.userid }
            })
            .then(function (response) {
                $scope.user = response.data;
            }).then(function (response) {});
        }

        $scope.items = [];

        var postData = {
            projectType: $scope.projectType,
            page: 1,
            amount: 4
        };

        if (request.userid != undefined) {
            postData.userid = request.userid;
        }

        $scope.$watch(packagesService.getPage, function (newValue, oldValue) {
            postData.page = newValue;
            $scope.getProjects();
        });

        $scope.getProjects = function () {
            $http({
                method: 'POST',
                url: '/api/mod/packages/models/packages',
                data: postData
            })
            .then(function (response) {
                $scope.items = response.data;

                for (index in $scope.items) {
                    var gitRaw = "https://raw.githubusercontent.com";

                    try {
                        var gitRoot = $scope.items[index].projectGitURL.split("//");
                        var gitRootStart = gitRoot[1].indexOf("/");
                        var gitRoot = gitRaw + gitRoot[1].substring(gitRootStart);
                    } catch (err) {
                        // console.log("url format error");
                        return;
                    }

                    var gitIcon = gitRoot + '/master/icon.png'

                    $scope.items[index].gitIcon = gitIcon;
                }
            },
            function (response) {});
        }

        $scope.getProjects();

        $scope.ShowModifyProjectDialog = function (packageId) {
            packagesService.setModifyPackageID(packageId);

            $uibModal.open({
                templateUrl: '/wiki/mod/packages/partials/packages_project_modify.html',
                controller: "packagesProjectsModifyController",
                size: 'lg'
            }).result.then(function (params) {
                alert(params.msg)
                $scope.projectType = params.projectType;
                $scope.getProjects();
            }, function (text, error) {});
        }

        $scope.DeleteProject = function (packageId) {
            if (confirm($scope.deleteDesc)) {
                $http({
                    method: "POST",
                    url: "/api/mod/packages/models/packages/deletePackage",
                    data: {
                        packageId: packageId
                    }
                })
                .then(function (response) {
                    alert(response.data.msg);

                    if (response.data.result == 1) {
                        $scope.page = 1;
                        packagesService.setForceUpdatePagin(1);
                        $scope.getProjects();
                    }
                }, function (response) {});
            }
        }
    }])
    .controller('packagesProjectsCreateController', ["Account","$scope","$http","$uibModalInstance","packagesService",function (Account, $scope, $http, $uibModalInstance, packagesService) {
        $scope.projectName     = '';
        $scope.projectDesc     = '';
        $scope.version         = '';
        $scope.projectGitURL   = '';
        $scope.projectType     = packagesService.getProjectsType();
        $scope.projectTypeName = '';
        $scope.projectReleases = '';
 
        $scope.$on("onUserProfile", function (event, user) {
            $scope.user = angular.copy(user);
        });

        $scope.$watch('projectType', function (newValue, oldValue) {
            if (newValue == 'npl') {
                $scope.projectTypeName = 'npl package';
            } else if (newValue == 'paracraft') {
                $scope.projectTypeName = 'paracraft模块';
            }
        });

        $scope.$watch('projectGitURL', function (newValue, oldValue) {
            if (newValue != '') {
                $(".project-releases").attr("placeholder", newValue + '/archive/master.zip');
            } else {
                $(".project-releases").attr("placeholder", 'http://github.com/tatfook/NPLCAD/archive/master.zip');
            }
        });

        $scope.close = function(){
            $uibModalInstance.close();
        };

        $scope.confirm = function () {
            var gitRaw = "https://raw.githubusercontent.com";

            try {
                var gitRoot      = $scope.projectGitURL.split("//");
                var gitRootStart = gitRoot[1].indexOf("/");
                var gitRoot      = gitRaw + gitRoot[1].substring(gitRootStart);
            } catch (err) {
                alert("url format error");
                return;
            }

            var getIcon   = gitRoot + '/master/icon.png';
            var getREADME = gitRoot + '/master/README.md';

            $http({
                method: 'GET',
                url: getREADME,
                headers: {
                    'Authorization': undefined
                }, // remove auth header for this request
                skipAuthorization: true, // this is added by our satellizer module, so disable it for cross site requests.
                transformResponse: [function (data) {
                    return data; // never transform to json, return as it is
                }]
            })
            .then(function (response) {},
            function () {
                return alert("You need to upload README.md in your git repository");
            });

            $http({
                method: 'GET',
                url: getIcon,
                headers: {
                    'Authorization': undefined
                }, // remove auth header for this request
                skipAuthorization: true, // this is added by our satellizer module, so disable it for cross site requests.
                transformResponse: [function (data) {
                    return data; // never transform to json, return as it is
                }]
            })
            .then(function () {
                $http.post('/api/mod/packages/models/packages/createPackage', {
                        projectName:     $scope.projectName,
                        projectDesc:     $scope.projectDesc,
                        version:         $scope.version,
                        projectGitURL:   $scope.projectGitURL,
                        projectReleases: $scope.projectReleases,
                        projectType:     $scope.projectType,
                        displayName:     $scope.user.displayName
                    })
                    .then(function (response) {
                        if (response.data.result == 1) {
                            returnData = {};
                            returnData.msg = response.data.msg;
                            returnData.projectType = $scope.projectType;
                            $uibModalInstance.close(returnData);
                        }
                    }, function (error) {});

            },
            function () {
                return alert("You need to upload icon.png in your git repository");
            });
        }
    }])
    .controller('packagesProjectsModifyController', ["Account","$scope","$http","$uibModalInstance","packagesService",function (Account, $scope, $http, $uibModalInstance, packagesService) {
        $scope.projectName = '';
        $scope.projectDesc = '';
        $scope.projectGitURL = '';
        $scope.projectType = packagesService.getProjectsType();
        $scope.version = '';
        $scope.projectTypeName = '';

        if ($scope.projectType == "npl") {
            $scope.projectTypeName = "Modify your npl package";
            $scope.versionDesc = "Version";
            $scope.projectGitURLDesc = 'Git URL';
            $scope.projectReleasesDesc = 'Download URL';
            $scope.projectNameDesc = "Project name";
            $scope.descriptionDesc = "Description";
        } else if ($scope.projectType == "paracraft") {
            $scope.projectTypeName = "修改 Paracraft 模块信息";
            $scope.versionDesc = "版本";
            $scope.projectGitURLDesc = 'Git URL';
            $scope.projectReleasesDesc = '下载 URL';
            $scope.projectNameDesc = "项目";
            $scope.descriptionDesc = "描述";
        }

        $scope.packageId = 0;

        $scope.$watch(packagesService.getModifyPackageId, function (newValue, oldValue) {
            if (newValue != 0) {
                $scope.packageId = newValue;

                $http({
                    method: 'POST',
                    url: '/api/mod/packages/models/packages/getOnePackage',
                    data: {
                        packageId: $scope.packageId
                    }
                })
                    .then(function (response) {
                            $scope.projectName = response.data.projectName;
                            $scope.projectDesc = response.data.projectDesc;
                            $scope.projectGitURL = response.data.projectGitURL;
                            $scope.projectReleases = response.data.projectReleases;
                            $scope.version = response.data.version;
                        },
                        function (response) {

                        });
            } else {
                return alert('packageId error');
            }
        });

        $scope.close = function(){
            $uibModalInstance.close();
        };

        $scope.confirm = function () {
            $http.post('/api/mod/packages/models/packages/modifyPackage', {
                    projectName: $scope.projectName,
                    projectDesc: $scope.projectDesc,
                    projectGitURL: $scope.projectGitURL,
                    projectReleases: $scope.projectReleases,
                    version: $scope.version,
                    packageId: $scope.packageId
                })
                .then(function (response) {
                    if (typeof (response.data) == "object") {
                        returnData = {};
                        returnData.msg = "Package modify success";
                        returnData.projectType = $scope.projectType;
                        $uibModalInstance.close(returnData);
                    } else {
                        return alert('Package modify fail');
                    }
                }, function (error) {
                });
        }
    }])
    .controller('Pagination', ["$scope" , "$log" , "$http" , "packagesService" , function ($scope, $log, $http, packagesService) {
        $scope.$watch(packagesService.getProjectsType, function (newValue, oldValue) {
            $scope.projectType = newValue;
            $scope.getPackageStats();
        });

        $scope.$watch(packagesService.getForceUpdatePagin, function (newValue, oldValue) {
            $scope.getPackageStats();
            packagesService.setForceUpdatePagin(0);
        });

        //packagestats
        $scope.getPackageStats = function () {
            $http({
                method: 'POST',
                url: '/api/mod/packages/models/packages/getPackagesStats',
                data: {
                    statsType: "packageStats",
                    projectType: $scope.projectType
                }
            })
            .then(function (response) {
                if (response.data.statsType != 'nil') {
                    $scope.totalItems = response.data.quantity;
                } else {
                    $scope.totalItems = 0;
                }

                $scope.itemsPerPage = 4;
                $scope.currentPage = 1;
            }, function (response) {});
        }

        $scope.getPackageStats();

        $scope.pageChanged = function () {
            packagesService.setPage($scope.currentPage);
            //alert('Page changed to: ' + $scope.currentPage);
        };
    }]);

    return htmlContent;
});
