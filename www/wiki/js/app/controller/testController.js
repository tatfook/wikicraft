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
			//util.post(config.apiUrlPrefix + "test/cookie",{}, function(data){
				//console.log(data);
			//}, function() {
				//util.post(config.apiUrlPrefix + "test/getCookie",{}, function(data){
					//console.log(data);
				//});
			//});

			console.log($.cookie());

			util.$http({
				method:"GET",
				url:"http://xiaoyao.localhost.com:8900/api/wiki/models/user/isLogin",
				withCredentials:true,
			});
			util.$http({
				method:"GET",
				url:"http://xiaoyao.localhost.com:8900/api/wiki/models/test/getCookie",
				withCredentials:true,
			});

			//var iframe = document.getElementById("keepworkLogin");
			//iframe.onload = function() {
				//var win = iframe.contentWindow;
				//win.postMessage({
					//key:"this is a test",
				//}, "*");
				//console.log("--------");
			//}

			//window.addEventListener("message", function(e){
				//console.log(e);
			//});
		}

		$scope.$watch("$viewContentLoaded", init);

	}]);

	return htmlContent;
});

