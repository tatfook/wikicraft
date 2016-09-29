angular.module('MyApp')
.controller('packagesProjectsController', function ($scope, $uibModal, Account, $http) {
    Account.setRequireSignin(true);

    $scope.$watch(Account.getUser, function (newValue, oldValue) {
        $scope.user = angular.copy(newValue);
    });

    $scope.$watch('projectType', function (newValue, oldValue) {
        if (newValue == 'a') {
            $scope.projectTypeName = 'npl package';
        } else if(newValue == 'b') {
            $scope.projectTypeName = 'paracraft mod';
        }
    });

    $scope.tabsActive = 1;
    
    $scope.projectName     = 'My fitst Project';
    $scope.projectDesc     = 'My fitst Project DESC';
    $scope.projectGitURL   = 'https://github.com/onedou/DOC';
    $scope.projectType     = 'a';
    $scope.projectTypeName = '';

    $scope.ShowCreateProjectDialog = function () {
        $uibModal.open({
            templateUrl: WIKI_WEBROOT + "partials/packages_project_create.html",
            controller: "packagesProjectsController",
        }).result.then(function (proj) {
            
        }, function (text, error) {

        });
    };

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
            projectType: $scope.projectType
        })
        .then(function (response) {

        }, function (error) {});
    }

    $scope.ShowModifyProjectDialog = function () {
        $uibModal.open({
            templateUrl: WIKI_WEBROOT + "partials/packages_project_modify.html",
            controller: "packagesProjectsController",
        }).result.then(function (proj) {
            $http.put("/api/wiki/models/project/new", {
                name: proj.name,
                fork: proj.fork,
                color: proj.color,
            }).then(function (response) {
                $scope.lastCreatedProjName = proj.name;
                $scope.getProjects();
            }).catch(function (response) {
                console.log("error:" + response.data.message);
            });
        }, function (text, error) {

        });
    }

    $scope.DeleteProject = function () {
        if (confirm("Are you sure delete this project?")) {
            alert('OK!!!');
        }
    }

    $scope.setTabs = function (params) {
        $scope.tabsActive = params;
    }



})