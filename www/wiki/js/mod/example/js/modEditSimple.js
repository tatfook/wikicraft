/**
 * Created by wuxiangan on 2017/1/9.
 */

define(['app', 'text!wikimod/example/html/modEditSimple.html'], function (app, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("modEditSimpleController", ['$scope',function ($scope) {
			wikiBlock.init({
				scope:$scope,
				styles:[
				{
					design:{
                        text:'style1',
                        cover: 'http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1513589432838.png'
					}
				},
				{
					design:{
						text:'style2',
					}
				}
				],
				params_template:{
					design:{
						is_leaf:true,
						require:true,
						text:"style1", // 默认值
					},
					title:{
						is_leaf:true,
						is_show: true, // 出现视图
						editable: true, // 可编辑
						name:"标题",
						type:"text",
					}
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
