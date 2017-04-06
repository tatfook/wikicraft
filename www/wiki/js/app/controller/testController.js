/**
 * Created by wuxiangan on 2017/1/6.
 */

define([
    'app',
    'helper/util',
    'helper/markdownwiki',
    'text!html/test.html',
], function (app, util, markdownwiki, htmlContent) {
    console.log("testController");
    app.registerController("testController", ['$scope', function ($scope) {
        function init() {
            console.log("init testController");
            $scope.message = "hello world";
        }
        
        init();
        //$scope.$watch("$viewContentLoaded", init);
    }]);


    return htmlContent;
});

