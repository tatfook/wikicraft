
define([
	'app',
	'helper/util',
	'text!wikimod/wiki/html/headliner.html',
], function(app, util, htmlContent){

	function registerController(wikiblock) {
		app.registerController("headlinerController", ["$scope", function($scope){
			wikiblock.initScope($scope);

			$scope.get_design_list = function() {
				var list = [];
				var modParams = angular.copy(wikiblock.modParams);

				list.push(modParams);

				modParams = angular.copy(modParams);
				modParams.title.text = "this is a test";
				list.push(modParams);

				return list;
			}
		}]);
	}

	return {
		render: function(wikiblock) {
			registerController(wikiblock);
			return htmlContent;
		}
	}
});
