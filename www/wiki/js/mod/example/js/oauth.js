/**
 * Created by wuxiangan on 2017/1/6.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/example/html/oauth.html',
], function (app, util,  htmlContent) {
	function registerController(wikiBlock) {
		app.registerController("exampleOautController", ['$scope','$http','$auth', function ($scope, $http, $auth) {
			function init() {
				$scope.goOauth = function(){
					// console.log("client redirect auth page");
					//var redirect_uri = encodeURIComponent("http://localhost:8900/wiki/login");
					var redirect_uri = "http://localhost:8900/wiki/oauth";
					util.go("oauth?response_type=code&client_id=1000000&redirect_uri="+redirect_uri+"&scope=login&state=test");
					return ;
				}

				$scope.standardOauth = function() {
					$auth.authenticate("keepwork").then(function(response){
						// console.log(response);
						// console.log(response.data);
					}, function(response){
						// console.log(response);
					});
				}

			}
			$scope.$watch("$viewContentLoaded", init);
		}]);
	}
    
    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});

/*
 ```@example/js/oauth
 {
 }
 ```
 */
