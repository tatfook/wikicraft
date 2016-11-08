angular.module('MyApp')
.factory('packagesService', function () {
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
})
.controller('packagesProjectsController', function ($scope, $uibModal, $http, Account, packagesService, $location ,$rootScope) {
    Account.setRequireSignin(true);

    $rootScope.$on('$locationChangeSuccess', function () {
        if ($location.path() == "/npl") {
            $scope.projectType = 'npl';
        } else if ($location.path() == "/paracraft") {
            $scope.projectType = 'paracraft';
        } else {
            $scope.projectType = 'paracraft';
        }

        if($scope.projectType == 'npl'){
            $scope.editProfile = 'Edit profile';
            $scope.create = 'Create';
            $scope.deleteDesc = "Are you sure delete this project?";
        }else if($scope.projectType == 'paracraft'){
            $scope.editProfile = '个人设置';
            $scope.create = '新建';
            $scope.deleteDesc = "是否确定删除你的项目？";
        }

        packagesService.setProjectsType($scope.projectType);

        $scope.$watch(Account.getUser, function (newValue, oldValue) {
            $scope.user = angular.copy(newValue);
        });

        $scope.$watch(packagesService.getPage, function (newValue, oldValue) {
            $scope.page = newValue;
            $scope.getProjects();
        });

        $scope.items = [];
        $scope.page  = 1;

        $scope.getProjects = function () {
            $http({
                method: 'POST',
                url: '/api/mod/packages/models/packages',
                data: {
                    projectType: $scope.projectType,
                    page: $scope.page,
                    amount: 4
                }
            })
            .then(function (response) {
                $scope.items = response.data
            },
            function (response) {});
        }

        $scope.getProjects();

        $scope.ShowCreateProjectDialog = function () {
            $uibModal.open({
                templateUrl: MOD_WEBROOT + "partials/packages_project_create.html",
                controller: "packagesProjectsCreateController",
            }).result.then(function (params) {
                alert(params.msg);
                if ($scope.projectType == params.projectType) {
                    packagesService.setForceUpdatePagin(1);
                } else {
                    $scope.projectType = params.projectType;
                    packagesService.setProjectsType($scope.projectType);
                }

                $scope.getProjects();
            }, function (text, error) {

            });
        };

        $scope.ShowModifyProjectDialog = function (packageId) {
            packagesService.setModifyPackageID(packageId);

            $uibModal.open({
                templateUrl: MOD_WEBROOT + "partials/packages_project_modify.html",
                controller: "packagesProjectsModifyController",
            }).result.then(function (params) {
                alert(params.msg)
                $scope.projectType = params.projectType;
                $scope.getProjects();
            }, function (text, error) {

            });
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
                }, function (response) {
                    
                });
            }
        }
    });
})
.controller('packagesProjectsCreateController', function (Account, $scope, $http, $uibModalInstance, packagesService) {
    $scope.projectName = '';
    $scope.projectDesc = '';
    $scope.version = '';
    $scope.projectGitURL = '';
    $scope.projectType = packagesService.getProjectsType();
    $scope.projectTypeName = '';
    $scope.projectReleases = '';

    $scope.$watch(Account.getUser, function (newValue, oldValue) {
        $scope.user = angular.copy(newValue);
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
        }else{
            $(".project-releases").attr("placeholder", 'http://github.com/tatfook/NPLCAD/archive/master.zip');
        }
    });

    $scope.confirm = function () {
        var gitRaw = "https://raw.githubusercontent.com";

        try {
            var gitRoot       = $scope.projectGitURL.split("//");
            var gitRootStart = gitRoot[1].indexOf("/");
            var gitRoot       = gitRaw + gitRoot[1].substring(gitRootStart);
        } catch (err) {
            return alert("url format error");
        }

        var getIcon   = gitRoot + '/master/icon.png';
        var getREADME = gitRoot + '/master/README.md';

        $http({
            method  : 'GET',
            url     : getREADME,
            headers : {
                'Authorization': undefined,
            }, // remove auth header for this request
            skipAuthorization : true, // this is added by our satellizer module, so disable it for cross site requests.
            transformResponse : [function (data) {
                return data; // never transform to json, return as it is
            }],
        })
        .then(function (response) {},
            function (response) {
                return alert("You need to upload README.md in your git repositary");
        });

        $http({
            method  : 'GET',
            url     : getIcon,
            headers : {
                'Authorization': undefined,
            }, // remove auth header for this request
            skipAuthorization : true, // this is added by our satellizer module, so disable it for cross site requests.
            transformResponse : [function (data) {
                return data; // never transform to json, return as it is
            }],
        })
        .then(function (response) {
            $http.post('/api/mod/packages/models/packages/createPackage', {
                projectName     : $scope.projectName,
                projectDesc     : $scope.projectDesc,
                version         : $scope.version,
                projectGitURL   : $scope.projectGitURL,
                projectReleases : $scope.projectReleases,
                projectType     : $scope.projectType,
                displayName     : $scope.user.displayName
            })
            .then(function (response) {
                if (response.data.result == 1) {
                    returnData = {};
                    returnData.msg = response.data.msg;
                    returnData.projectType = $scope.projectType;
                    $uibModalInstance.close(returnData);
                }
            }, function (error) { });

        },
        function (response) {
            return alert("You need to upload icon.png in your git repositary");
        });
    }
})
.controller('packagesProjectsModifyController', function (Account, $scope, $http, $uibModalInstance, packagesService) {
    $scope.projectName = '';
    $scope.projectDesc = '';
    $scope.projectGitURL = '';
    $scope.projectType = packagesService.getProjectsType();
    $scope.version = '';
    $scope.projectTypeName = '';

    if ($scope.projectType == "npl") {
        $scope.projectTypeName = "Modify your npl package";
        $scope.versionDesc = "Version";
        $scope.projectNameDesc = "Project name";
        $scope.descriptionDesc = "Description";
    } else if ($scope.projectType == "paracraft") {
        $scope.projectTypeName = "修改 Paracraft 模块信息";
        $scope.versionDesc = "版本";
        $scope.projectNameDesc = "项目";
        $scope.descriptionDesc = "描述"
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
                $scope.projectName   = response.data.projectName;
                $scope.projectDesc   = response.data.projectDesc;
                $scope.projectGitURL = response.data.projectGitURL;
                $scope.version        = response.data.version;
            },
            function (response) {

            });
        } else {
            return alert('packageId error');
        }
    });

    $scope.confirm = function () {
        $http.post('/api/mod/packages/models/packages/modifyPackage', {
            projectName: $scope.projectName,
            projectDesc: $scope.projectDesc,
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
        }, function (error) { });
    }
})
.controller('Pagination', function ($scope, $log, $http, packagesService) {
    $scope.$watch(packagesService.getProjectsType, function (newValue, oldValue) {
        $scope.projectType = newValue;
        $scope.getPackageStats();
    });

    $scope.$watch(packagesService.getForceUpdatePagin, function (newValue, oldValue) {
        $scope.getPackageStats();
        packagesService.setForceUpdatePagin(0)
    })

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
        }, function (response) { });
    }

    $scope.getPackageStats();

    $scope.pageChanged = function () {
        packagesService.setPage($scope.currentPage);
        //alert('Page changed to: ' + $scope.currentPage);
    };
});