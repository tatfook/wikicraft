/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-01-22 10:48:28
 */
define([
    'app',
    'helper/util',
    'helper/markdownwiki',
    'text!wikimod/profile/html/controls.html'
], function (app, util, markdownwiki, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("profileControlCtrl", ['$scope','$rootScope', '$timeout', function ($scope, $rootScope, $timeout) {
            var initView = function(){
                $timeout(function(){
                    var md = markdownwiki({breaks: true});
                    var subHtml = md.render($rootScope.subMdContent);
                    util.html("#profileMain", subHtml);
                }, 0);
            }
            $scope.$watch('$viewContentLoaded', initView());
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});