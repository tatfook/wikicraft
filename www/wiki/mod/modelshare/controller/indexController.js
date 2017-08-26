define([
    'app',
    'text!mod/modelshare/html/index.html',
], function (app, htmlContent) {
    app.controller('indexController', ['$scope', '$http' , function ($scope,$http) {
        $scope.modName = "example";
		$scope.h2h2 = [];
	
		//删除数据
		$scope.delete = function(item, index){
			var id = item._id;
			console.log(index)
			http("POST", "api/mod/modelshare/models/modelshare/delete", {"id" : id},function(data){
				$scope.h2h2.splice(index,1);
				console.log($scope.h2h2)
			});
		}

		//查找数据
		function getData(){
			http("POST","api/mod/modelshare/models/modelshare/getList",function(data){
				$scope.h2h2   = data.data;
			});
		}
		
		getData();
		
		//整合
		function http(type, url, params, cb_success, cb_fail){
			var host = "http://localhost:8099/";
			
			if(!cb_success){
				cb_success = params;
			}
			
			if(typeof(cb_success) != "function"){
				cb_success = function(){};
			}
			
			if(typeof(cb_fail) != "function"){
				cb_fail = function(){};
			}
			
			$http({
				"method" : type,
				"url"    : host + url,
				"params" : params ? params : {},
			}).then(function(response){
				cb_success(response.data);
			},cb_fail);
		}
		
		//按键切换
		$scope.set = function (params) {
				$scope.divVar = params;
		};
			
		$scope.divVar = 4;
		$scope.set = function (params) {
				$scope.divVar = params;
			};
		}]);
			
			return htmlContent;
})