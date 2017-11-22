
define([
	'app',
	'helper/util',
	'text!wikimod/wiki/html/headliner.html',
], function(app, util, htmlContent){

	function registerController(wikiblock) {
		app.registerController("headlinerController", ["$scope", function($scope){

			$scope.params = angular.copy(wikiblock.modParams || {});
			console.log($scope.params);
		}]);
	}

	return {
		render: function(wikiblock) {
			registerController(wikiblock);
			return htmlContent;
		}
	}
});
