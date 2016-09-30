angular.module('MyApp')
.factory('packagesService', function () {
    var newPackages = {
        status: 0,
        type: ''
    };

    return {
        getNewPackages: function () {
            return newPackages;
        },
        setNewPackages: function (_newPackages) {
            newPackages = _newPackages;
        }
    };
})
.controller('packagesProjectsController', function ($scope, $uibModal, $http, Account, packagesService) {
    Account.setRequireSignin(true);

    $scope.$watch(Account.getUser, function (newValue, oldValue) {
        $scope.user = angular.copy(newValue);
    });

    $scope.$watch(packagesService.getNewPackages, function (newValue, oldValue) {
        if (newValue.status == 1) {
            $scope.projectType = newValue.type;
            $scope.getProjects();

            var _newPackages = {status:0,type:''}
            packagesService.setNewPackages(_newPackages);
        }
    });

    $scope.projectType  = 'a';
    $scope.items        = [];

    $scope.getProjects = function () {
        $http({
            method: 'POST',
            url: '/api/wiki/models/packages',
            data: {
                projectType: $scope.projectType
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
            templateUrl: WIKI_WEBROOT + "partials/packages_project_create.html",
            controller: "packagesProjectsCreateController",
        }).result.then(function (params) {
            alert(params);
        }, function (text, error) {

        });
    };

    $scope.ShowModifyProjectDialog = function () {
        $uibModal.open({
            templateUrl: WIKI_WEBROOT + "partials/packages_project_modify.html",
            controller: "packagesProjectsModifyController",
        }).result.then(function (params) {
            
        }, function (text, error) {

        });
    }

    $scope.DeleteProject = function () {
        if (confirm("Are you sure delete this project?")) {
            alert('OK!!!');
        }
    }

    $scope.setTabs = function (params) {
        $scope.projectType = params;
        $scope.getProjects();
    }

    //$scope.$on('updateItems', function (event,msg) {
    //    console.log(msg);
    //    //$scope.getProjects();
    //});
})
.controller('packagesProjectsCreateController', function (Account, $scope, $http, $uibModalInstance, packagesService) {
    $scope.projectName = 'My fitst Project';
    $scope.projectDesc = 'My fitst Project DESC';
    $scope.projectGitURL = 'https://github.com/onedou/DOC';
    $scope.projectType = 'a';
    $scope.projectTypeName = '';

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
        var gitRaw       = "https://raw.githubusercontent.com";
        var gitRoot      = $scope.projectGitURL.split("//");
        var gitRootStart = gitRoot[1].indexOf("/");
        var gitRoot      = gitRaw + gitRoot[1].substring(gitRootStart);

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
        .then(function (response) { },
        function (response) {
            return alert("You need to upload icon.png in your git repositary");
        });

        $http.post('/api/wiki/models/packages/createPackage', {
            projectName: $scope.projectName,
            projectDesc: $scope.projectDesc,
            projectGitURL: $scope.projectGitURL,
            projectType: $scope.projectType,
            UserId: $scope.user._id
        })
        .then(function (response) {
            if (response.data.result == 1) {
                //$scope.$emit('updateItems', 'OKOKOK!');
                var _newPackages = { status: 1, type: $scope.projectType }
                packagesService.setNewPackages(_newPackages);
                $uibModalInstance.close(response.data.msg);
            }
        }, function (error) {});
    }
})
.controller('packagesProjectsModifyController', function (Account, $scope, $http, $uibModalInstance, packagesService) {

})