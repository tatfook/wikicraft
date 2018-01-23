/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-01-19 14:48:28
 */
define([
    'app', 
    'text!wikimod/profile/html/certifications.html'
], function (app, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("certificationCtrl", ['$scope',function ($scope) {
			wikiBlock.init({
				scope:$scope,
				params_template:{
                    certifications:{
                        is_leaf: true,
                        require: false,
                        certifications:[{
                            is_leaf: true,
                            title:"初级计算机资格",
                            link:"http://www.baidu.com",
                            getDate:"2017-11-06"
                        }]
                    }
                }
            });
            
            $scope.certifications = $scope.params.certifications;
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});