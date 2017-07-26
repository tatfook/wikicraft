/**
 * Created by wuxiangan on 2017/1/6.
 */

define([
		'app',
		'helper/util',
		'helper/dataSource',
		'text!html/test.html',
		'ace',
], function (app, util, dataSource,  htmlContent) {
	app.registerController("testController", ['$scope','$http','$auth', function ($scope, $http, $auth ) {
		function init() {
			//console.log($location, $location.hash());
			//$anchorScroll();
		}
		$scope.$watch("$viewContentLoaded", init);

	}]);

	return htmlContent;
});

