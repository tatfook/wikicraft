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
			//console.log(html2canvas, typeof html2canvas);	
			$scope.message = "this is a test";
			html2canvas($("#__mainContent__")[0], {
				onrendered:function(canvas){
					console.log(canvas);
					document.body.appendChild(canvas);
					//var src = canvas.toDataURL('image/png');
					//$("#testImg").attr("src", src);
				},
				height:300,
				width:300,
			});
		}
		$scope.$watch("$viewContentLoaded", init);

	}]);

	return htmlContent;
});

