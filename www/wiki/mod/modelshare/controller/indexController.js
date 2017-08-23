define([
    'app',
    'text!mod/modelshare/html/index.html',
], function (app, htmlContent) {
    app.controller('indexController', ['$scope', '$http' , function ($scope,$http) {
        $scope.modName = "example";
		$http({
				method: 'GET',
				url: 'http://localhost:8099/api/mod/modelshare/models/modelshare/text'
			}).then(function successCallback(response) {
					$scope.h2h2 = response.data;
				}, function errorCallback(response) {
					// 请求失败执行代码
			});
        $scope.divVar = 4;
        $scope.set = function (params) {
            $scope.divVar = params;
        };
    }]);
    
    return htmlContent;
})