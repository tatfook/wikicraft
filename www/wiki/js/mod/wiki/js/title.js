
define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/title.html',
], function (app, util, htmlContent) {

    // 使用闭包使模块重复独立使用
    function registerController(wikiblock) {
        // 比赛类活动奖励控制器
        app.registerController("titleController", ['$scope','$sce', function ($scope, $sce) {
            // $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            // $scope.modParams = angular.copy(wikiblock.modParams || {});

            // function init() {
            //     $scope.content = $sce.trustAsHtml(config.services.markdownit.render($scope.modParams.content || ""));
            // }

            // $scope.$watch("$viewContentLoaded", init);

            var initObj = {
				scope:$scope,
				styles:[
					{
						"design": {
							"text":"style1",
						},
					},
				],

				params_template: {
					design:{
						is_leaf: true, // 叶子对象默认填true
						type:"text",   // 地段类型
						editable:false, // 是否可以编辑
						is_show:false,  // 可视化是否显示 undefined取值editable
						name:"样式",   // 表单显示名
						text:"style1", // 默认值
						require: true, // 必填字段 没有使用默认值
                    },
                    img:{
                        is_leaf: true, // 叶子对象默认填true
                        type:"link",   // 地段类型
                        editable:true, // 是否可以编辑
                        is_show:true,  // 可视化是否显示 undefined取值editable
                        name:"logo",   // 表单显示名
                        text:"https://www.baidu.com/img/baidu_jgylogo3.gif", // 默认值
                        href:"https://www.baidu.com/img/baidu_jgylogo3.gif", // 默认值
                    	require: true, // 必填字段 没有使用默认值(默认值得有)
                        },
				   	h1:{
						is_leaf: true, // 叶子对象默认填true
						type:"text",   // 地段类型
						editable:true, // 是否可以编辑
						is_show:true,  // 可视化是否显示 undefined取值editable
						name:"标题",   // 表单显示名
						text:"title", // 默认值
						require: true, // 必填字段 没有使用默认值(默认值得有)
					},
				   	h2:{
						is_leaf: true, // 叶子对象默认填true
						type:"text",   // 地段类型
						editable:true, // 是否可以编辑
						is_show:true,  // 可视化是否显示 undefined取值editable
						name:"子标题",   // 表单显示名
						text:"subtitle", // 默认值
						require: true, // 必填字段 没有使用默认值(默认值得有)
					},
				   	// paragraphs:{
					// 	is_leaf: true, // 叶子对象默认填true
					// 	type:"text",   // 地段类型
					// 	editable:true, // 是否可以编辑
					// 	is_show:true,  // 可视化是否显示 undefined取值editable
					// 	name:"段落",   // 表单显示名
					// 	text:"paragraphs", // 默认值
					// 	require: true, // 必填字段 没有使用默认值(默认值得有)
					// },
				   	// link:{
					// 	is_leaf: true, // 叶子对象默认填true
					// 	type:"link",   // 地段类型
					// 	editable:true, // 是否可以编辑
					// 	is_show:true,  // 可视化是否显示 undefined取值editable
					// 	name:"链接",   // 表单显示名
					// 	text:"href text", // 默认值
					// 	href:"http://www.baidu.com", // 默认值
					// 	require: true, // 必填字段 没有使用默认值(默认值得有)
					// },
				   	// image:{
					// 	is_leaf: true, // 叶子对象默认填true
					// 	type:"link",   // 地段类型
					// 	editable:true, // 是否可以编辑
					// 	is_show:true,  // 可视化是否显示 undefined取值editable
					// 	name:"链接",   // 表单显示名
					// 	text:"href text", // 默认值
					// 	href:"http://www.baidu.com", // 默认值
					// 	require: true, // 必填字段 没有使用默认值(默认值得有)
					// },
					
					// list:{
					// 	is_leaf: true,
					// 	type: "list",
					// 	editable: true,
					// 	is_show: true,
					// 	require: true,
					// 	name:"简单列表",
					// 	list: [
					// 		{
					// 			is_leaf: true, // 叶子对象默认填true
					// 			type:"link",   // 地段类型
					// 			editable:true, // 是否可以编辑
					// 			is_show:true,  // 可视化是否显示 undefined取值editable
					// 			name:"链接",   // 表单显示名
					// 			text:"href text", // 默认值
					// 			href:"http://www.baidu.com", // 默认值
					// 			require: true, // 必填字段 没有使用默认值(默认值得有)
					// 		},
					// 	]
					// },
					// object_list:{
					// 	is_leaf: true,
					// 	type: "list",
					// 	editable: true,
					// 	is_show: true,
					// 	require: true,
					// 	name:"对象列表",
					// 	list: [
					// 		{
					// 			link: {
					// 				is_leaf: true, // 叶子对象默认填true
					// 				type:"link",   // 地段类型
					// 				editable:true, // 是否可以编辑
					// 				is_show:true,  // 可视化是否显示 undefined取值editable
					// 				name:"链接",   // 表单显示名
					// 				text:"href text", // 默认值
					// 				href:"http://www.baidu.com", // 默认值
					// 				require: true, // 必填字段 没有使用默认值(默认值得有)
					// 			}
					// 		},
					// 	]
					// },
				}
			}
			wikiblock.init(initObj);
			console.log($scope.params);



        }]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
        }
    }
});

/*
```@wiki/js/title
{
    "moduleKind":"title",
    "title":"大赛简介",
    "content":"比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍"
}
```
*/
/*
 ```@wiki/js/title
 {
 "moduleKind":"title2",
 "column":"大赛简介",
 "columnInfo":"大赛简介",
 "content":"比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍"
 }
 ```
 */
/*
 ```@wiki/js/title
 {
 "moduleKind":"title3",
 "title":"标题标题",
 "content":"简介简介  \n[可以加链接](链接url)  \n [可以加链接](链接Url)：（我不是链接）"
 }
 ```
 */
