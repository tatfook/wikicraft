/**
 * Created by wuxiangan on 2017/1/6.
 */

define([
    'app',
    'helper/util',
    'helper/wikimarkdown',
    'text!html/test.html',
], function (app, util, wikimarkdown, htmlContent) {
    console.log("testController");
    app.registerController("testController", ['$scope', function ($scope) {
        function init() {
            console.log("init testController");
            $scope.message = "hello world";
        }
        init();
        //$scope.$watch("$viewContentLoaded", init);
    }]);

    var md = wikimarkdown();
    var html = md.render(htmlContent)
    setTimeout(function () {
        util.html('#__UserSitePageContent__', html, undefined, false);
    },1000)
    return htmlContent;
});

