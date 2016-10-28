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
.filter('getProjectTypeName', function () {
    return function (input) {
        if (input == 'a') {
            return "packages_npl_install";
        } else if (input == 'b') {
            return "packages_paracraft_install";
        }
    }
})
.controller('packagesProjectsController', function ($scope, $uibModal, $http, Account, packagesService, $location) {
    Account.setRequireSignin(true);

    var absUrl = $location.absUrl();

    if ($location.url() == "/npl") {
        $scope.projectType = 'a';
    } else if ($location.url() == "/paracraft") {
        $scope.projectType = 'b';
    } else {
        $scope.projectType = 'a';
    }

    packagesService.setProjectsType($scope.projectType);

    $scope.$watch(Account.getUser, function (newValue, oldValue) {
        $scope.user = angular.copy(newValue);
    });

    $scope.$watch(packagesService.getPage, function (newValue, oldValue) {
        $scope.page = newValue;
        $scope.getProjects();
    });

    $scope.items        = [];
    $scope.page         = 1;

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
        if (confirm("Are you sure delete this project?")) {
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

    $scope.setTabs = function (params) {
        $scope.projectType = params;
        
        if (params == "a") {
            $location.url("/npl");
            packagesService.setProjectsType("a");
        } else if (params == "b") {
            $location.url("/paracraft");
            packagesService.setProjectsType("b");
        }

        $scope.page = 1;
        $scope.getProjects();
    }

    //$scope.$on('updateItems', function (event,msg) {
    //    console.log(msg);
    //    //$scope.getProjects();
    //});
})
.controller('packagesProjectsCreateController', function (Account, $scope, $http, $uibModalInstance, packagesService) {
    $scope.projectName      = '';
    $scope.projectDesc      = '';
    $scope.projectGitURL    = '';
    $scope.projectType      = 'a';
    $scope.projectTypeName  = '';

    $scope.$watch(Account.getUser, function (newValue, oldValue) {
        $scope.user = angular.copy(newValue);
    });

    $scope.$watch('projectType', function (newValue, oldValue) {
        if (newValue == 'a') {
            $scope.projectTypeName = 'npl package';
        } else if (newValue == 'b') {
            $scope.projectTypeName = 'paracraft mod';
        }
    });

    $scope.confirm = function () {
        var gitRaw = "https://raw.githubusercontent.com";

        try {
            var gitRoot = $scope.projectGitURL.split("//");
            var gitRootStart = gitRoot[1].indexOf("/");
            var gitRoot = gitRaw + gitRoot[1].substring(gitRootStart);
        } catch (err) {
            return alert("url format error");
        }
        
        var getIcon   = gitRoot + '/master/icon.png'
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
        .then(function (response) { },
        function (response) {
            return alert("You need to upload README.md in your git repositary");
        });

        $http({
            method: 'GET',
            url: getIcon,
            headers: {
                'Authorization': undefined,
            }, // remove auth header for this request
            skipAuthorization: true, // this is added by our satellizer module, so disable it for cross site requests.
            transformResponse: [function (data) {
                return data; // never transform to json, return as it is
            }],
        })
        .then(function (response) {

            $http.post('/api/mod/packages/models/packages/createPackage', {
                projectName: $scope.projectName,
                projectDesc: $scope.projectDesc,
                projectGitURL: $scope.projectGitURL,
                projectType: $scope.projectType,
                displayName: $scope.user.displayName
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
    $scope.projectName     = '';
    $scope.projectDesc     = '';
    $scope.projectGitURL   = '';
    $scope.version         = '';
    $scope.projectTypeName = '';
    $scope.projectType     = '';

    $scope.packageId     = 0;

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
                $scope.version       = response.data.version;

                if (response.data.projectType == "a") {
                    $scope.projectType = "a";
                    $scope.projectTypeName = "npl package"
                } else if (response.data.projectType == "b") {
                    $scope.projectType = "b";
                    $scope.projectTypeName = "paracraft mod"
                }
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

    //$scope.setPage = function (pageNo) {
    //    $scope.currentPage = pageNo;
    //};

    $scope.pageChanged = function () {
        packagesService.setPage($scope.currentPage);
        //alert('Page changed to: ' + $scope.currentPage);
    };

    //$scope.maxSize = 5;
    //$scope.bigTotalItems = 175;
    //$scope.bigCurrentPage = 1;
});