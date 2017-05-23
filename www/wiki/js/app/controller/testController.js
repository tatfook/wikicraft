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
    app.registerController("testController", ['$scope','confirmDialog', function ($scope, confirmDialog) {
        console.log($scope.imgsPath);
        //$scope.imgsPath = "/test/";

        function init() {
            console.log("init testController");
            console.log(confirmDialog);
            confirmDialog({title:"test", content:"hello world", cancelBtn:false}, function () {
                console.log("click confirm");
            }, function () {
                console.log("click cancel");
            });
        }
        //init();
        $scope.$watch("$viewContentLoaded", init);
    }]);
    
    return '<style>\n' + cssContent + '\n</style>\n'+ htmlContent;
});

