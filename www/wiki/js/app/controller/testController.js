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
			//util.post(config.apiUrlPrefix + "test/getCookie",{}, function(data){
				//console.log(data);
			//});

			var iframe = document.getElementById("keepworkLogin");
			iframe.onload = function() {
				var win = iframe.contentWindow;
				win.postMessage({
					key:"this is a test",
				}, "*");
				console.log("--------");
			}

			window.addEventListener("message", function(e){
				console.log(e);
			});
		}

		$scope.$watch("$viewContentLoaded", init);

	}]);

	return htmlContent;
});

