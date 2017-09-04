/**
 * Created by wuxiangan on 2017/1/6.
 */

define([
		'app',
		'helper/util',
		'helper/mdconf',
		'text!html/test.html',
], function (app, util, mdconf, htmlContent) {
	app.registerController("testController", ['$scope','$http','$auth', function ($scope, $http, $auth ) {
		function init() {
			config.apiUrlPrefix = "http://xiaoyao.localhost.com:8900/api/wiki/models/";
			//util.post(config.apiUrlPrefix + "test/cookie",{}, function(data){
				//console.log(data);
			//});
			util.post(config.apiUrlPrefix + "test/getCookie",{}, function(data){
				console.log(data);
			});
		}

		$scope.$watch("$viewContentLoaded", init);

	}]);

	return htmlContent;
});

