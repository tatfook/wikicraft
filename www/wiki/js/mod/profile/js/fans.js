/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-01-22 19:01:25
 */
define([
    'app', 
    'text!wikimod/profile/html/fans.html'
], function (app, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("fansCtrl", ['$scope',function ($scope) {
            console.log($scope.followUserList);
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});