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
	app.registerController("testController", ['$scope','$http','$auth', function ($scope, $http, $auth) {
		function init() {
			console.log(ace);
			var editor = ace.edit('editor');
			editor.setTheme("ace/theme/monokai");
			editor.getSession().setMode("ace/mode/html");
		}
		$scope.$watch("$viewContentLoaded", init);

	}]);

	return htmlContent;
});

