define([
    'app',
    'text!mod/modelshare/html/index.html',
], function (app, htmlContent) {
    app.controller('indexController', ['$scope', '$http' , function ($scope,$http) {
		var apiUrl = "/api/mod/modelshare/models/modelshare";
		
		$scope.maxSize     = 6;
		$scope.totalItems  = 0;
		$scope.currentPage = 1;
		
        $scope.itemPrePage = 6;
		$scope.list        = [];
		
		http("POST", apiUrl + "/getListCount", function(data){
			$scope.totalItems = data.data;
			// console.log(data)
		});

		//查找数据
		$scope.getList = function(){
			var skip = ($scope.currentPage - 1) * $scope.itemPrePage;
			
			var params = {
				"limit" : $scope.itemPrePage,
				"skip"  : skip
			};
			
			http("POST", apiUrl + "/getList", params, function(data){
				$scope.list = data.data;
				// console.log(data)
			});
		}
		
		$scope.getList();
		
		//最新
		$scope.getListNew = function(){
			var skip = ($scope.currentPage - 1) * $scope.itemPrePage;
			
			var params = {
				"limit" : $scope.itemPrePage,
				"skip"  : skip
			};
			
			http("POST", apiUrl + "/getListNew", params, function(data){
				$scope.list = data.data;
				// console.log(data)
			});
		}
		
		//热门
		$scope.getListHot = function(){
			var skip = ($scope.currentPage - 1) * $scope.itemPrePage;
			
			var params = {
				"limit" : $scope.itemPrePage,
				"skip"  : skip
			};
			
			http("POST", apiUrl + "/getListHot", params, function(data){
				$scope.list = data.data;
				// console.log(data)
			});
		}
		

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