
define([
	'app',
	'helper/util',
	'text!wikimod/wiki/html/headliner.html',
], function(app, util, htmlContent){

	function registerController(wikiblock) {
		app.registerController("headlinerController", ["$scope", function($scope){
			wikiblock.initScope($scope);
		}]);
	}

	return {
		render: function(wikiblock) {
			registerController(wikiblock);
			return htmlContent;
		}
	}
});
