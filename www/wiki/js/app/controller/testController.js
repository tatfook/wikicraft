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
    var blockList = md.parse(htmlContent);
    var $compile = util.getAngularServices().$compile;
    var $rootScope = util.getAngularServices().$rootScope;
    var html = $compile(blockList[0].htmlContent)($rootScope);
    console.log(html);
    setTimeout(function () {
        $('#test').html(html)
    },5000);
    return htmlContent;
});

