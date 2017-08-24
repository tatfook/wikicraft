define([
    'app',
    'text!mod/modelshare/html/index.html',
], function (app, htmlContent) {
    app.controller('indexController', ['$scope', '$http' , function ($scope,$http) {
        $scope.modName = "example";
		/*$http({
				method: 'GET',
				url: 'http://localhost:8099/api/mod/modelshare/models/modelshare/text'
			}).then(function successCallback(response) {
					$scope.h2h2 = response.data;
				}, function errorCallback(response) {
					// 请求失败执行代码
			});*/
		$scope.h2h2 = [];
	
		$scope.delete = function(item, index){
			var id = item._id;
			console.log(index)
			http("POST", "api/mod/modelshare/models/modelson/delete", {"id" : id},function(data){
				$scope.h2h2.splice(index,1);
				console.log($scope.h2h2)
			});
		}

		$scope.add = function(){
			var Ason = {
					"worldName" : $scope.worldName,
					"name"      : $scope.name,
					"modNumber" : $scope.modNumber,
					"big"       : $scope.big,
					"words"     : $scope.words,
			}
			console.log(Ason)
			http("POST","api/mod/modelshare/models/modelson/add",Ason,function(data){
					//console.log($scope.h2h2)
					$scope.h2h2[$scope.h2h2.length] = data;
			});
		}
		
		$scope.modify = function(item){
			var params = {
				"_id"          : item._id,
				"worldName" : $scope.worldName,
				"name"      : $scope.name,
				"modNumber" : $scope.modNumber,
				"big"       : $scope.big,
				"words"     : $scope.words,
			}
			http("POST","api/mod/modelshare/models/modelson/modify", params, function(data){
				console.log(data);
				if(data.errcode == 1){
					alert("修改成功");
				}else{
					alert("修改失败");
				}
			})
		}
		
		
		function getData(item){
			var params = {
				"_id"          : 48,
			}
			http("GET","api/mod/modelshare/models/modelson/getData", params, function(data){
				console.log(data)
				$scope.worldName = data.data.worldName;
				$scope.name      = data.data.name;
				$scope.modNumber = data.data.modNumber;
				$scope.big       = data.data.big;
				$scope.words     = data.data.words;
			});
		}
		
		getData();
		
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