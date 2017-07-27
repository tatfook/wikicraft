/**
 * Created by wuxiangan on 2017/1/6.
 */

define([
		'app',
		'helper/util',
		'helper/storage',
		'helper/dataSource',
		'text!html/test.html',
		'ace',
], function (app, util, storage, dataSource,  htmlContent) {
	app.registerController("testController", ['$scope','$http','$auth', function ($scope, $http, $auth ) {
		function init() {
			//console.log($location, $location.hash());
			//$anchorScroll();
			//
			$scope. goMyPay = function(){
				storage.sessionStorageSetItem('userCenterContentType', 'userProfile');
				storage.sessionStorageSetItem("userCenterSubContentType", 'myPay');
				//util.go("userCenter");

				util.go("userCenter?"+util.getQueryString({
					userCenterContentType:"userProfile",
					userCenterSubContentType:"myPay",
				}));
			}
		}
		$scope.$watch("$viewContentLoaded", init);

	}]);

	return htmlContent;
});

