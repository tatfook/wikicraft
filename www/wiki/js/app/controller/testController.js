/**
 * Created by wuxiangan on 2017/1/6.
 */

define([
		'app',
		'helper/util',
		'helper/storage',
		'helper/dataSource',
		'text!html/test.html',
		//'html2canvas',
], function (app, util, storage, dataSource,  htmlContent/*, html2canvas*/) {
	app.registerController("testController", ['$scope','$http','$auth', function ($scope, $http, $auth ) {
		function init() {
			util.post(config.apiUrlPrefix + "test/echo",{list:[{test:"tes"}]});
			util.ajax({
				url:"http://221.0.111.131:19001/Application/essearch",
				type:"POST",
				data:{
					keyword:"test",
					page:1,
					flag:4,
					highlight:1
				},
				success: function(result, status, xhr) {
					console.log(result);
				},
				error: function(xhr, status, error){

				}
			});
		}
		$scope.$watch("$viewContentLoaded", init);

	}]);

	return htmlContent;
});

