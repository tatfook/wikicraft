/**
 * Created by wuxiangan on 2017/1/6.
 */

define([
    'app',
    'helper/util',
    'text!html/test.html',
    'text!css/test.css',
], function (app, util, htmlContent, cssContent) {
    console.log("testController");
    app.registerController("testController", ['$scope', function ($scope) {
        console.log($scope.imgsPath);
        //$scope.imgsPath = "/test/";

        function init() {
            console.log("init testController");

        }
        //init();
        $scope.$watch("$viewContentLoaded", init);
    }]);
    
    return '<style>\n' + cssContent + '\n</style>\n'+ htmlContent;
});

