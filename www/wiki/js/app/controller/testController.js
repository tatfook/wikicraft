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
			function esSearch(query) {
				util.ajax({
					url:"http://221.0.111.131:19001/Application/kwcustom_search",
					type:"GET",
					data:{
						keyword:angular.toJson({
							query:{
								bool:{
									must:{
										wildcard:{
											"extra_search.keyword":"*吴香安*",
										}
									},
									should:[
									{
										term:{
											extra_type:"pageinfo:[]",
										},

									},
									{
										wildcard:{
											extra_type:"pageinfo:*[test]*",
										}
									}		
									]
								}
							},
							highlight:{
								pre_tags:[
									"<span>"
								],
								post_tags:[
									"</span>"
								],
								fields:{
									extra_search:{},
								}
							}
						}),
						from:1,
						highlight:1,
						size:10,
					}
				});
			}
			esSearch();

			//util.post(config.apiUrlPrefix + "test/cookie",{}, function(data){
				//console.log(data);
			//}, function() {
				//util.post(config.apiUrlPrefix + "test/getCookie",{}, function(data){
					//console.log(data);
				//});
			//});

			//console.log($.cookie());

			//util.$http({
				//method:"GET",
				//url:"http://xiaoyao.localhost.com:8900/api/wiki/models/user/isLogin",
				//withCredentials:true,
			//});
			//util.$http({
				//method:"GET",
				//url:"http://xiaoyao.localhost.com:8900/api/wiki/models/test/getCookie",
				//withCredentials:true,
			//});

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

