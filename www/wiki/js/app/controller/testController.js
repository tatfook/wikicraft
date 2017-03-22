/**
 * Created by wuxiangan on 2017/1/6.
 */

define(['app',
    'text!html/test.html',
], function (app, htmlContent) {
    console.log("testController");
    app.registerController("testController", ['$scope', function ($scope) {
        console.log("---init testController");
        function init() {
            console.log("init testController");
        }
        init();
        //$scope.$watch("$viewContentLoaded", init);
    }]);

    return htmlContent;
});

