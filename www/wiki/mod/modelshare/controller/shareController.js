define([
    'app',
    'text!mod/modelshare/html/share.html',
	'helper/util'
], function (app, htmlContent, util) {
    app.controller('shareController', ['$scope' , '$http' , function ($scope,$http) {
		// console.log(util.getQueryObject());
        $scope.parameter = util.getQueryObject();
		$scope.count = 0;
		$scope.isFirst = true;
		
		$scope.DownClick = function(item){
			var params = {
				"_id"          : $scope.parameter.id,
				"count"        : $scope.count,
			}
			$scope.count++;
		
			http("POST","api/mod/modelshare/models/modelshare/modify", params, function(data){
				// console.log(data);
				if(data.error.id == 0){
					alert("下载成功");
				}else{
					alert("下载失败");
				}
			})
		}
		/*$scope.DownClick = function(){
			$scope.count++;
			// console.log($scope.count);
			
			http("POST","api/mod/modelshare/models/modelshare/modify",{"count" : $scope.count},function(data){
					// console.log(data);
			});
		}
		
		/*$scope.DownClick = function() {
				$scope.count++;
				// console.log($scope.count);
			}*/
			
		if($scope.parameter.id){
			$scope.parameter.id
		}else{
			location.href = "/wiki/notfound"
			return;
		}
		
		

		$scope.delete = function(item, index){
			var id = item._id;
			http("POST", "api/mod/modelshare/models/modelshare/delete", {"id" : id},function(data){
				$scope.h2h2.splice(index,1);
			});
		}

		function getData(item){
			
			var params = {
				"_id"          : $scope.parameter.id,
			}
			
			http("POST","api/mod/modelshare/models/modelshare/getOne", params, function(data){
				
				$scope.templateName = data.data.templateName;
				$scope.username     = data.data.username;
				$scope.modelsnumber = data.data.modelsnumber;
				$scope.blocks       = data.data.blocks;
				$scope.volume       = data.data.volume;
				$scope.createDate   = data.data.createDate;
				$scope.count  = data.data.count?data.data.count:0;
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


			$scope.clickStart = function(index) {
				//$scope.clearStart();
				if($scope.isFirst){
					for (var i = 1; i <= index; i++) {
					var span = document.getElementById('start' + i);
					span.innerHTML = '★';
					}
					$scope.isFirst = false;
				}
			}


			/*$scope.clearStart = function() {
				for (var i = 1; i <= 5; i++) {
					var span = document.getElementById('start' + i);
					span.innerHTML = '☆';
				}

			} */
		}]);

		return htmlContent;
});



		
		/*$scope.modify = function(item){
			var params = {
				"_id"          : item._id,
				"templateName" : item.templateName,
				"username"     : item.username,
				"modelsnumber" : item.modelsnumber,
				"blocks"       : item.blocks,
				"volume"       : item.volume,
				"words"        : item.words,
			}
			http("POST","api/mod/modelshare/models/modelshare/modify", params, function(data){
				// console.log(data);
				if(data.errcode == 1){
					alert("修改成功");
				}else{
					alert("修改失败");
				}
			})
		}*/
