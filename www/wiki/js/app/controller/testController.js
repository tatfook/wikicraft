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
			$scope.name = "xiaoyao";

			$scope.htmlContent = "<div>hello {{name}}</div>";

			var index = 1;
			setInterval(function(){
				$scope.name = "xiaoyao" + index;
				$scope.htmlContent = "<div>hello {{name}}</div>";
				index++;
				$scope.$apply();
			}, 1000);
		}

		$scope.$watch("$viewContentLoaded", init);

	}]);

	return htmlContent;
});

