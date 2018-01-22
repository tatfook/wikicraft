/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-01-22 19:01:11
 */
define([
    'app', 
    'text!wikimod/profile/html/followUser.html'
], function (app, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("followsUserCtrl", ['$scope',function ($scope) {
            console.log($scope.fansList);
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});