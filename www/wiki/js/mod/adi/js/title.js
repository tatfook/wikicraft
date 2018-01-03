
define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/title.html',
], function (app, util, htmlContent) {

    function registerController(wikiblock) {
        app.registerController("titleController", ['$scope','$sce', function ($scope, $sce) {
			$scope.editorMode = wikiblock.editorMode;

			initObj = {
				scope  : $scope,
				styles : [
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
				params_template : {
					design:{
						is_leaf: true, // 叶子对象默认填true
						type:"text",   // 地段类型
						editable:false, // 是否可以编辑
						is_mod_hide:true,  // 可视化是否显示 undefined取值editable
						is_card_show:true,
						name:"样式",   // 表单显示名
						text:"style1", // 默认值
						require: true, // 必填字段 没有使用默认值
                    },
                    media_img:{
                        is_leaf: true, // 叶子对象默认填true
						type:"media",   // 地段类型
						mediaType:"image",
                        editable:true, // 是否可以编辑
						is_mod_hide:true,  // 可视化是否显示 undefined取值editable
						is_card_show:true,
                        name:"logo",   // 表单显示名
                        text:config.wikiModPath + 'adi/assets/imgs/titleMod.png', // 默认值
                        href:"", // 默认值
                    	require: true, // 必填字段 没有使用默认值(默认值得有)
                        },
				   	link_title:{
						is_leaf: true, // 叶子对象默认填true
						type:"link",   // 地段类型
						editable:true, // 是否可以编辑
						is_mod_hide:true,  // 可视化是否显示 undefined取值editable
						is_card_show:true,
						name:"标题",   // 表单显示名
						text:"YOUR HEAD LINE", // 默认值
						href:"",// 默认值
						require: true, // 必填字段 没有使用默认值(默认值得有)
					},
					link_subtitle:{
						is_leaf: true, // 叶子对象默认填true
						type:"link",   // 地段类型
						editable:true, // 是否可以编辑
						is_mod_hide:true,  // 可视化是否显示 undefined取值editable
						is_card_show:true,
						name:"子标题",   // 表单显示名
						text:"YOUR SUB LINE", // 默认值
						href:"",// 默认值
						require: true, // 必填字段 没有使用默认值(默认值得有)
					},
				}
            }

			wikiblock.init(initObj);
		}]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
		},
		initObj: function(){
			return initObj;
		}
    }
});

