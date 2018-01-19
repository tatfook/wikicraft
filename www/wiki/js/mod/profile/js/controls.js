/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-01-19 20:10:42
 */
define([
    'app',
    'helper/util',
    'text!wikimod/profile/html/controls.html'
], function (app, util, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("profileControlCtrl", ['$scope','$rootScope', function ($scope, $rootScope) {
            var initView = function(){
                console.log($rootScope.subMdContent);
                console.log($("#profileMain"));
                util.html("#profileMain", $rootScope.subMdContent);
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