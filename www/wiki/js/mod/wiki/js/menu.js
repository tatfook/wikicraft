/**
 * Created by big on 2017/12/19.
 */

define(['app', 'text!wikimod/wiki/html/menu.html'], function (app, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("menuController", ['$scope',function ($scope) {
			wikiBlock.init({
				scope:$scope,
				styles:[
				{
					design:{
						text:'left',
					}
				},
				{
					design:{
						text:'right',
					}
				}
				],
				params_template:{
					design:{
						is_leaf: true,
						require: true,
						text:"left", // 默认值
					},
					menu:{
                        is_leaf: true,
                        type: "menu",
                        editable: true,
                        is_show: true,
                        name: "菜单",
                        require: true,
                        text: [
							{
								id: 1,
								name : '腾讯新闻',
								url  : 'https://news.qq.com',
								note : '腾讯新闻',
								children: [
									{
										id   : 2,
										name : '八卦新闻',
										url  : 'https://news.qq.com',
										note : '八卦新闻',
										children: []
									}
								]
							}
						]
                    },
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
