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
			console.log(mdconf.jsonToMd("hello world"));
			console.log(mdconf.jsonToMd({key:"value"}));
			console.log(mdconf.jsonToMd(["list1", "list2"]));
			console.log(mdconf.jsonToMd([["list1", "list2"], ["list3", "list4"]]));
			console.log(mdconf.jsonToMd({key:"value", list:["list1", "list2"]}));
			console.log(mdconf.jsonToMd({key:"value", list:[{key1:"value1"},{key2:"value2"}]}));
			console.log(mdconf.jsonToMd({key:"value", list:[{key1:"value1"},{key2:"value2", list:["list1"]}]}));
			var text = mdconf.jsonToMd({key:"value", list:[{key1:"value1"},{key2:"value2", list:["list1"]}]});
			console.log(mdconf.mdToJson("hello world\n"));
		}

		$scope.$watch("$viewContentLoaded", init);

	}]);

	return htmlContent;
});

