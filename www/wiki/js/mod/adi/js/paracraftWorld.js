define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/paracraftWorld.html',
], function (app, util, htmlContent) {
	var initObj;

    function registerController(wikiblock) {
        app.registerController("paracraftWorldController", ['$scope','$sce', function ($scope, $sce) {
			initObj = {
				scope  : $scope,
				styles : [
					{
						"design": {
							"text":"style1",
						},
					}
				],
				params_template : {
					design : {
						is_leaf: true, // 叶子对象默认填true
						type:"text",   // 地段类型
						editable:false, // 是否可以编辑
						is_show:false,  // 可视化是否显示 undefined取值editable
						name:"样式",   // 表单显示名
						text:"style1", // 默认值
						require: true, // 必填字段 没有使用默认值
					},
					logoUrl : {
						is_leaf  : true,
						type     : "link",
						editable : false,
						is_show  : false,
						name     : "样式",
						text     : "",
						require  : true,
					},
					version : {
						is_leaf  : true,
						type     : "link",
						editable : false,
						is_show  : false,
						name     : "样式",
						text     : "",
						require  : true,
					},
					opusId : {
						is_leaf  : true,
						type     : "link",
						editable : false,
						is_show  : false,
						name     : "样式",
						text     : "",
						require  : true,
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