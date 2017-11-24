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
			var obj = undefined, text = undefined;
			obj = "hello world"
			text = mdconf.jsonToMd(obj);
			console.log(text);
			console.log(angular.toJson(mdconf.mdToJson(text)));
			console.log(mdconf.mdToJson(text));

			obj = {key:"value"}
			text = mdconf.jsonToMd(obj);
			console.log(text);
			console.log(angular.toJson(mdconf.mdToJson(text)));
			console.log(mdconf.mdToJson(text));

			obj = ["list1", "list2"]
			text = mdconf.jsonToMd(obj);
			console.log(text);
			console.log(angular.toJson(mdconf.mdToJson(text)));
			console.log(mdconf.mdToJson(text));

			obj = [["list1", "list2"], ["list3", "list4"]]
			text = mdconf.jsonToMd(obj);
			console.log(text);
			console.log(angular.toJson(mdconf.mdToJson(text)));
			console.log(mdconf.mdToJson(text));

			obj = {key:"value", list:["list1", "list2"]}
			text = mdconf.jsonToMd(obj);
			console.log(text);
			console.log(angular.toJson(mdconf.mdToJson(text)));
			console.log(mdconf.mdToJson(text));

			obj = {key:"value", list:[{key1:"value1"},{key2:"value2"}]}
			text = mdconf.jsonToMd(obj);
			console.log(text);
			console.log(angular.toJson(mdconf.mdToJson(text)));
			console.log(mdconf.mdToJson(text));

			obj = {key:"value", list:[{key1:"value1"},{key2:"value2", list:["list1"]}]}
			text = mdconf.jsonToMd(obj);
			console.log(text);
			console.log(angular.toJson(mdconf.mdToJson(text)));
			console.log(mdconf.mdToJson(text));

			obj = {a:{b:{c:"k"}}};
			text = mdconf.jsonToMd(obj);
			console.log(text);
			console.log(angular.toJson(mdconf.mdToJson(text)));
			console.log(mdconf.mdToJson(text));
		}

		$scope.$watch("$viewContentLoaded", init);

	}]);

	return htmlContent;
});

