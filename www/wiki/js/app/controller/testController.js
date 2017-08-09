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
			util.go("pay?" + util.getQueryString({
				app_name:"KEEPWORK",
				app_goods_id:1,
				price:1,
				additional:angular.toJson({
					vip_order_no:1
				}),
			}));
		}
		$scope.$watch("$viewContentLoaded", init);

	}]);

	return htmlContent;
});

