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
			util.ajax({
				url:"http://221.0.111.131:19001/Application/kwaccurate_search",
				type:"GET",
				data:{
					querytype:"site_name",
					keyword:"t*st",
					fuzzymatch:1,
					page:1,
					highlight:1,
					size:10,	
				},
			});
		}
		$scope.$watch("$viewContentLoaded", init);

	}]);

	return htmlContent;
});

