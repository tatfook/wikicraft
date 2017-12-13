
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
					{
						"design": {
							"text":"style2",
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
                        text:config.wikiModPath + 'wiki/assets/imgs/titleMod.png', // 默认值
                        href:config.wikiModPath + 'wiki/assets/imgs/titleMod.png', // 默认值
                    	require: true, // 必填字段 没有使用默认值(默认值得有)
                        },
				   	hOne:{
						is_leaf: true, // 叶子对象默认填true
						type:"text",   // 地段类型
						editable:true, // 是否可以编辑
						is_show:true,  // 可视化是否显示 undefined取值editable
						name:"标题",   // 表单显示名
						text:"YOUR HEAD LINE", // 默认值
						require: true, // 必填字段 没有使用默认值(默认值得有)
					},
				   	hTwo:{
						is_leaf: true, // 叶子对象默认填true
						type:"text",   // 地段类型
						editable:true, // 是否可以编辑
						is_show:true,  // 可视化是否显示 undefined取值editable
						name:"子标题",   // 表单显示名
						text:"YOUR SUB LINE", // 默认值
						require: true, // 必填字段 没有使用默认值(默认值得有)
					},
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

