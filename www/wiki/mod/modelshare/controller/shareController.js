define([
    'app',
    'text!mod/modelshare/html/share.html',
], function (app, htmlContent) {
    app.controller('shareController', ['$scope', function ($scope) {
        $scope.modName = "example";
    }]);

    return htmlContent;
});