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
	app.registerController("testController", ['$scope','$http','$auth','$location', '$anchorScroll', function ($scope, $http, $auth, $location, $anchorScroll) {
		function init() {
			//console.log($location, $location.hash());
			//$anchorScroll();
		}
		$scope.$watch("$viewContentLoaded", init);

	}]);

	return htmlContent;
});

