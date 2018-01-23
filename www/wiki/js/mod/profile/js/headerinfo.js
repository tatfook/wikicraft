/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-01-19 11:31:51
 */
define([
    'app', 
    'text!wikimod/profile/html/headerinfo.html'
], function (app, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("userMsgCtrl", ['$scope',function ($scope) {
			wikiBlock.init({
				scope:$scope,
				params_template:{
					desc:"个人简介内容"
				}
			});

			console.log($scope.params);			
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});