/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-01-19 14:35:52
 */
define([
    'app', 
    'text!wikimod/profile/html/experiences.html'
], function (app, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("experienceCtrl", ['$scope',function ($scope) {
			wikiBlock.init({
				scope:$scope,
				params_template:{
                    experiences:{
                        is_leaf: true,
                        require: false,
                        experiences:[{
                            is_leaf: true,
                            logoUrl:"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1516099391929.jpeg",
                            title:"学习C语言",
                            link:"/photograph/page01",
                            startDate:"2017-06-09",
                            endDate:"2017-11-06"
                        }]
                    }
                }
            });
            
            $scope.experiences = $scope.params.experiences;
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});