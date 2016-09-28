angular.module('MyApp')
.controller('packagesProjectsController', function ($scope, $uibModal) {

    $scope.ShowCreateProjectDialog = function () {
        $uibModal.open({
            templateUrl: WIKI_WEBROOT + "partials/packages_project_create.html",
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
    };

})