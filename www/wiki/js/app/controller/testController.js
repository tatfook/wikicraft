/**
 * Created by wuxiangan on 2017/1/6.
 */

define([
    'app',
    'helper/util',
	'helper/dataSource',
    'text!html/test.html',
], function (app, util, dataSource,  htmlContent) {
    app.registerController("testController", ['$scope','$http', function ($scope, $http) {
        function init() {
			$http.get(config.apiUrlPrefix + 'test/helloworld', {isShowLoading:true}).success(function(response){
				console.log(response);
			});
			$http.get(config.apiUrlPrefix + 'test/helloworld', {cache:true}).success(function(response){
				console.log(response);
			});
			$http.get(config.apiUrlPrefix + 'test/helloworld', {cache:true}).success(function(response){
				console.log(response);
			});
        }
        $scope.$watch("$viewContentLoaded", init);
    }]);
    
    return htmlContent;
});

