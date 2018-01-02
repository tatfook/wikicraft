define([
    'app',
    'helper/util',
	'text!wikimod/adi/html/pictureText.html',
], function (app, util, htmlContent) {

    function registerController(wikiblock) {
        app.registerController("pictureTextController", ['$scope','$sce', function ($scope, $sce) {

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
				params_template: {
					design:{
						is_leaf: true, // 叶子对象默认填true
						type:"text",   // 地段类型
						editable:false, // 是否可以编辑
						is_mod_hide:true,  // 可视化是否显示 undefined取值editable
						name:"样式",   // 表单显示名
						text:"style1", // 默认值
						require: true, // 必填字段 没有使用默认值
					},
					pictureTextImg:{
                        is_leaf: true, // 叶子对象默认填true
						type:"media",   // 地段类型
						mediaType: "image",
                        editable:true, // 是否可以编辑
                        is_card_show:true,  // 是否在adi中显示编辑
                        is_mod_hide:false,  // 在模块中是否隐藏
                        name:"picture",   // 表单显示名
                        text:config.wikiModPath + 'adi/assets/imgs/pictureMod.png', // 默认值
                        href:config.wikiModPath + 'adi/assets/imgs/pictureMod.png', // 默认值
                    	require: true, // 必填字段 没有使用默认值(默认值得有)
					},
					hOne:{
						is_leaf: true, // 叶子对象默认填true
						type:"link",   // 地段类型
						editable:true, // 是否可以编辑
						is_mod_hide:false,  // 可视化是否显示 undefined取值editable
						name:"标题",   // 表单显示名
						text:"一个人，一条路，人在途中",// 默认值
						href:"http://localhost", // 默认值
						require: true, // 必填字段 没有使用默认值(默认值得有)
					},
					hTwo:{
						is_leaf: true, // 叶子对象默认填true
						type:"link",   // 地段类型
						editable:true, // 是否可以编辑
						is_mod_hide:false,  // 可视化是否显示 undefined取值editable
						name:"子标题",   // 表单显示名
						text:"我们一直在旅行",// 默认值
						href:"http://localhost", // 默认值
						require: true, // 必填字段 没有使用默认值(默认值得有)
					},
					spanOne:{
						is_leaf: true, // 叶子对象默认填true
						type:"link",   // 地段类型
						editable:true, // 是否可以编辑
						is_card_show:true,  // 是否在adi中显示编辑
            			is_mod_hide:false,  // 在模块中是否隐藏
						name:"文字说明",   // 表单显示名
						text:"",// 默认值
						href:"http://localhost", // 默认值
						require: true, // 必填字段 没有使用默认值(默认值得有)
					},
					btn:{
                        is_leaf: true, // 叶子对象默认填true
                        type:"link",   // 地段类型
                        editable:true, // 是否可以编辑
                        is_card_show:true,  // 是否在adi中显示编辑
                        is_mod_hide:false,  // 在模块中是否隐藏
                        name:"按钮",   // 表单显示名
                        text:"更多照片", // 默认值
                        href:"http://localhost", // 默认值
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
		},
    }
});