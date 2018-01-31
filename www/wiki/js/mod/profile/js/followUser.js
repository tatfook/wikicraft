/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-01-31 14:56:24
 */
define([
    'app', 
    'text!wikimod/profile/html/followUser.html'
], function (app, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("followsUserCtrl", ['$scope',function ($scope) {
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});