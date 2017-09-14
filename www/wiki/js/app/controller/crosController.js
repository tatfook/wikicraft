
/*
 * Created by wuxiangan on 2017/1/6.
 */

define([
	"app",
	"helper/util",
], function(app, util){

	function crosHandle(e) {
		$auth = config.services.$auth;

		// postMessage
		function postMessage(data, origin) {
			origin = origin || "*";
			e.source.postMessage(data, origin);
		}

		var data = e.data || {};
		var result = {cmd:data.cmd};

		if (data.cmd == "echo") {
			postMessage(data);
		} else if (data.cmd == "is_login") {
			result.isLogin = $auth.isAuthenticated();
			postMessage(result);
		} else if (data.cmd == "element_style") {
			var selector = data.selector;
			var style = data.style;
			$(selector).css(style);
		}
		//console.log(e);
	}

	window.addEventListener("message", function(e){
		if (config.isBoostrap) {
			crosHandle(e);
		}
	});


	app.registerController("crosController", ["$scope", "$auth", function($scope, $auth){
		
	}]);


	return '<div ng-controller="crosController"></div>';
});
