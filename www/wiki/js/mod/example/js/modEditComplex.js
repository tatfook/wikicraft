
define([
	'app',
	'helper/util',
	'text!wikimod/example/html/modEditComplex.html',
], function(app, util, htmlContent){

	function registerController(wikiblock) {
		app.registerController("modEditComplexController", ["$scope", function($scope){
			var initObj = {
				scope:$scope,
				styles:[
					{
						"design": {
							"text":"style1",
						},
					},
					{
						"design":{
							"text":"style2",
						},
					},
				],

				params_template: {
					design:{
						is_leaf: true, // 叶子对象默认填true
						type:"text",   // 地段类型
						editable:false, // 是否可以编辑
						is_card_show:false,  // 是否在adi中显示编辑
						name:"样式",   // 表单显示名
						text:"style1", // 默认值
						require: true, // 必填字段 没有使用默认值
					},
					imageType:{
						is_leaf: true, // 叶子对象默认填true
                        type:"media",   // 地段类型
                        mediaType:"image",// 媒体类型（image | video）
						editable:true, // 是否可以编辑
						is_card_show:true,  // 是否在adi中显示编辑
                        is_mod_hide:false,  // 在模块中是否隐藏
						name:"图像",   // 表单显示名
						text:"http://localhost:8099/wiki/js/mod/adi/assets/imgs/titleMod.png", // 默认值
						href:"http://www.baidu.com", // 默认值
						require: true, // 必填字段 没有使用默认值(默认值得有)
                    },
                    // switch: {
                    //     is_leaf: true,
                    //     type: 'switch',
                    //     editable: true,
                    //     is_card_show: true,
                    //     is_mod_hide: false,
                    //     name: '阅读权限',
                    //     desc: '只限VIP阅读完整内容'
                    // },
                    // input: {
                    //     is_leaf: true,
                    //     type: 'input',
                    //     editable: true,
                    //     is_card_show: true,
                    //     is_mod_hide: false,
                    //     name: 'QQ调用',
                    //     label: 'QQ号',
                    //     text: '23432442314'
                    // },
                    // url: {
                    //     is_leaf: true,
                    //     type: 'url',
                    //     editable: true,
                    //     is_card_show: true,
                    //     is_mod_hide: false,
                    //     name: '引用',
                    //     label: '选择或输入URL',
                    //     href: ''
                    // },
                    board:{
                        is_leaf: true,
                        type: "diagram",
                        editable: true,
                        is_card_show:true,  // 是否在adi中显示编辑
                        is_mod_hide:false,  // 在模块中是否隐藏
                        name: "绘图板",
                        require: true
                    },
                    multiText:{
                        is_leaf: true,
                        type:"multiText",
                        editable: true,
                        is_card_show:true,  // 是否在adi中显示编辑
                        is_mod_hide:false,  // 在模块中是否隐藏
                        name: "多行文本",
                        text: "多行文本内容",
                        href: "",
						target: "_blank",
						require: true,
                    },
                    menu:{
                        is_leaf: true,
                        type: "menu",
                        editable: true,
                        is_card_show:true,  // 是否在adi中显示编辑
                        is_mod_hide:false,  // 在模块中是否隐藏
                        name: "菜单",
                        require: true,
                        text: [{
                            id: 12332434,
                            name: '试图',
                            url: 'liyu/site/views',
                            children: [{
                                      id: 1342143252,
                                      name: '我的试图',
                                      url: 'liyu/site/views/mine',
                                      children: []
                            }]
                        }]
                    },
				   	title:{
						is_leaf: true, // 叶子对象默认填true
						type:"text",   // 地段类型
						editable:true, // 是否可以编辑
						is_card_show:true,  // 是否在adi中显示编辑
                        is_mod_hide:false,  // 在模块中是否隐藏
						name:"标题",   // 表单显示名
						text:"title", // 默认值
						require: true, // 必填字段 没有使用默认值(默认值得有)
					},
				   	subtitle:{
						is_leaf: true, // 叶子对象默认填true
						type:"text",   // 地段类型
						editable:true, // 是否可以编辑
						is_card_show:true,  // 是否在adi中显示编辑
                        is_mod_hide:false,  // 在模块中是否隐藏
						name:"子标题",   // 表单显示名
						text:"subtitle", // 默认值
						require: true, // 必填字段 没有使用默认值(默认值得有)
					},
				   	paragraphs:{
						is_leaf: true, // 叶子对象默认填true
						type:"text",   // 地段类型
						editable:true, // 是否可以编辑
						is_card_show:true,  // 是否在adi中显示编辑
                        is_mod_hide:false,  // 在模块中是否隐藏
						name:"段落",   // 表单显示名
						text:"paragraphs", // 默认值
						require: true, // 必填字段 没有使用默认值(默认值得有)
					},
				   	link:{
						is_leaf: true, // 叶子对象默认填true
						type:"link",   // 地段类型
						editable:true, // 是否可以编辑
						is_card_show:true,  // 是否在adi中显示编辑
                        is_mod_hide:false,  // 在模块中是否隐藏
						name:"链接",   // 表单显示名
						text:"href text", // 默认值
						href:"http://www.baidu.com", // 默认值
						require: true, // 必填字段 没有使用默认值(默认值得有)
					},
				   	image:{
						is_leaf: true, // 叶子对象默认填true
						type:"link",   // 地段类型
						editable:true, // 是否可以编辑
						is_card_show:true,  // 是否在adi中显示编辑
                        is_mod_hide:false,  // 在模块中是否隐藏
						name:"链接",   // 表单显示名
						text:"href text", // 默认值
						href:"http://www.baidu.com", // 默认值
						require: true, // 必填字段 没有使用默认值(默认值得有)
					},
					
					list:{
						is_leaf: true,
						type: "list",
						editable: true,
						is_card_show:true,  // 是否在adi中显示编辑
                        is_mod_hide:false,  // 在模块中是否隐藏
						require: true,
						name:"简单列表",
						list: [
							{
								is_leaf: true, // 叶子对象默认填true
								type:"link",   // 地段类型
								editable:true, // 是否可以编辑
								is_card_show:true,  // 是否在adi中显示编辑
                                is_mod_hide:false,  // 在模块中是否隐藏
								name:"链接",   // 表单显示名
								text:"href text", // 默认值
								href:"http://www.baidu.com", // 默认值
								require: true, // 必填字段 没有使用默认值(默认值得有)
							},
						]
					},
					object_list:{
						is_leaf: true,
						type: "list",
						editable: true,
						is_card_show:true,  // 是否在adi中显示编辑
                        is_mod_hide:false,  // 在模块中是否隐藏
						require: true,
						name:"对象列表",
						list: [
							{
								link: {
									is_leaf: true, // 叶子对象默认填true
									type:"link",   // 地段类型
									editable:true, // 是否可以编辑
									is_card_show:true,  // 是否在adi中显示编辑
                                    is_mod_hide:false,  // 在模块中是否隐藏
									name:"链接",   // 表单显示名
									text:"href text", // 默认值
									href:"http://www.baidu.com", // 默认值
									require: true, // 必填字段 没有使用默认值(默认值得有)
								}
							},
						]
					},
				}
			}
			wikiblock.init(initObj);
			console.log($scope.params);
		}]);
	}

	return {
		render: function(wikiblock) {
			registerController(wikiblock);
			return htmlContent;
		}
	}
});
