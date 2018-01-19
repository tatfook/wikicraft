/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-01-19 14:27:36
 */
define([
    'app', 
    'text!wikimod/profile/html/works.html'
], function (app, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("worksCtrl", ['$scope',function ($scope) {
			wikiBlock.init({
				scope:$scope,
				params_template:{
                    works:{
                        is_leaf: true,
                        require: false,
                        works:[{
                            is_leaf: true,
                            logoUrl:"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1516099391929.jpeg",
                            title:"日常摄影作品",
                            workLink:"/photograph/page01",
                            desc:"介绍日常生活中容易拍摄的照片",
                            tags:["摄影","任务","记录"],
                            visitCount:253,
                            favoriteCount:43
                        }]
                    }
                }
            });
            
            $scope.works = $scope.params.works;
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});