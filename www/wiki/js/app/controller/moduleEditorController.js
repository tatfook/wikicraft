
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
		function get_value(k, t) {
			if(!k || !t) {
				return undefined;
			}

			var ks = k.split(".");
			for (var i = 0; i < ks.length; i++) {
				t = t[ks[i]];
				if (!t) {
					return t
				}
			}

			return t;
		}

		function init() {
			$scope.message = "angular test";


			$scope.fields = [
			{
				type:"text",
				displayName:"标题",
				id:"title",
			}
			];
			//$scope.params = {
				//meta_data:{
					//title:{
						//id:'title',
						//displayName:"标题",
					//},
					//list:[
					//{
						//key:{

						//}
					//}
					//],
					//object:{
						//key:{
							
						//}
					//}
				//},
				//data: {
					//title:"title",
					//subtitle:"subtitle",
					//description:"description",
					//list:[
					//{
						//key:'value'
					//}
					//],
					//object:{
						
					//}
				//}
			//};

			$scope.click_hide = function(data) {
				data.is_hide = !data.is_hide;
			}
			$scope.params = {
				title:{
					id:'title',
					name:"标题",
					desc:"描述",
					is_hide:false,
					type:"text",
					value:"title_value",
				},
				subtitle:{
					id:'subtitle',
					name:"子标题",
					desc:"描述",
					is_hide:false,
					type:"text",
					value:"subtitle_value",
				},
				description:{
					id:'description',
					name:"描述",
					desc:"描述",
					is_hide:false,
					type:"text",
					value:"description_value",
				},
				link:{
					id:"link",
					name:"链接",
					desc:"功能描述",
					is_hide:false,
					type:"link",
					value_text:"链接测试",
					value_href:"http://www.baidu.com",
				},
			}

			setTimeout(function(){
				$(".kp_module_editor_input_tag").click(function(e){
					console.log(e);
					console.log(e.target.dataset.id);
					var key = e.target.dataset.id;
					if (!key) {
						return;
					}

					$scope.data = get_value(key, $scope.params);
					console.log($scope.data);
					$scope.$apply();
				});

				$("#id").focus();
			});
		}

		$scope.test = function() {
			$("#id").focus();
		}

		$scope.$watch("$viewContentLoaded", init);
	}]);


	return htmlContent;
})
