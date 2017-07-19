define([
    'app',
    'text!mod/modelshare/html/index.html',
], function (app, htmlContent) {
    app.controller('indexController', ['$scope', function ($scope) {
        $scope.modName = "example";
        $scope.divVar = 4;
        $scope.set = function (params) {
            $scope.divVar = params;
        };
    }]);
    
    return htmlContent;
})