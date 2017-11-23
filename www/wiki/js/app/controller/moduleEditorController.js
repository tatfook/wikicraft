
define([
	'app',
	'helper/util',
	'text!html/moduleEditor.html',
], function(app, util, htmlContent){
	var objectEditor = {
		data: {},
		fields:[],
	}

	// 添加输入字段 {id:"html id". key:"key1.key2", type:"text!link|media", value:"字段值", isHide:false}
	objectEditor.addInputField = function(field){
		if (!field.id || !field.type) {
			console.log("object editor addInputField params error!");
			return;
		}
		
		field.key = field.key || field.id;
		field.displayName = field.displayName || field.key;
		self.fields.push(field);	
	}

	app.registerController("moduleEditorController", ['$scope', function($scope){
		var moduleEditorParams = {};
		// 转换数据格式
		function get_order_list(obj){
			var list = [];
			for (var key in obj) {
				if (typeof(obj[key]) == "object" && obj[key].editable) {
					list.push(obj[key]);
				}
			}

			for (var i = 0; i < list.length; i++) {
				for (var j = i+1; j < list.length; j++) {
					var io = list[i].order || 9999;
					var jo = list[j].order || 9999;
					if (io > jo) {
						var temp = list[j];
						list[j] = list[i];
						list[i] = temp;
					}
				}
			}

			return list;
		}

		// 隐藏事件
		$scope.click_hide = function(data) {
			data.is_hide = !data.is_hide;
		}

		// 点击列表项
		$scope.click_list_item = function(item) {
			$scope.datas_stack.push($scope.datas);
			$scope.datas = item;
		}

		$scope.close = function() {
			$scope.datas = $scope.datas_stack.pop();
			if (!$scope.datas) {
				//$scope.$close();
				$("#moduleEditorContainer").hide();
				moduleEditorParams.is_show = false;
				if (moduleEditorParams.wikiBlock) {
					moduleEditorParams.wikiBlock.applyModParams(moduleEditorParams.wikiBlock.modParams);
				}
			}
		}

		//$scope.$on("onModuleEditor", function(event, data){

		//});

		function init() {
			moduleEditorParams = config.shareMap.moduleEditorParams || {};
			config.shareMap.moduleEditorParams = moduleEditorParams;
			moduleEditorParams.$scope = $scope;
			moduleEditorParams.setEditorObj = function(obj) {
				$scope.datas = get_order_list(obj);
			}
			$scope.datas_stack = [];
			//var params = {
				//title: {
					//name:"标题",
					//id:"title",
					//desc:"输入标题文本",
					//type:"text",
					//text:"this is a title",
					//order:1,
					//editable:true,
				//},
				//link: {
					//name:"链接",
					//id:"link",
					//desc:"链接编辑",
					//type:"link",
					//text:"链接文本",
					//href:"链接地址",
					//order:2,
					//editable:true,
				//},
				//list: {
					//name:"列表",
					//id:'list',
					//desc:"列表对象",
					//type:"list",
					//editable:true,
					//list:[
					//{
						//listItemTitle: {
							//name:"标题",
							//id:"list_item_title",
							//desc:"列表项标题",
							//type:"text",
							//text:"list item title",
							//editable:true,
						//}
					//}
					//]
				//}
			//};
			//console.log($scope.datas);
		}

		$scope.$watch("$viewContentLoaded", init);
	}]);


	return htmlContent;
})
