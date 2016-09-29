angular.module('MyApp')
.controller('packagesProjectsController', function ($scope, $uibModal, Account, $http) {
    Account.setRequireSignin(true);

    $scope.$watch(Account.getUser, function (newValue, oldValue) {
        $scope.user = angular.copy(newValue);
    });

    $scope.tabsActive = 1;
    
    $scope.projectName   = 'My fitst Project';
    $scope.projectDesc   = 'My fitst Project DESC';
    $scope.projectGitURL = 'https://github.com/tatfook/wikicraft';

    $scope.ShowCreateProjectDialog = function () {
        $uibModal.open({
            templateUrl: WIKI_WEBROOT + "partials/packages_project_create.html",
            controller: "packagesProjectsController",
        }).result.then(function (proj) {
            
        }, function (text, error) {

        });
    };

    $scope.confirm = function () {
        $http.post('/api/wiki/models/packages/createPackage', {})
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