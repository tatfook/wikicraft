
define([
    'app',
    'text!wikimod/wiki/html/gamedate.html'
], function (app, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("gamedateController", ['$scope',function ($scope) {
            function init() {
                var moduleParams = wikiBlock.modParams;
                $scope.contributeDate = moduleParams.contributeDate || "待定";
                $scope.voteDate = moduleParams.voteDate || "待定";
                $scope.resultDate = moduleParams.resultDate || "待定";
            }
            init();
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        }
    }
});
