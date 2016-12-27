
define(['app'], function (app) {
    app.registerController("gamedateController", function ($scope) {
        $scope.htmlUrl = config.wikiModPath + 'game/pages/gamedate.page';

        function init() {
            var moduleParams = $scope.wikiBlockParams;
            $scope.contributeDate = moduleParams.contributeDate || "待定";
            $scope.voteDate = moduleParams.voteDate || "待定";
            $scope.resultDate = moduleParams.resultDate || "待定";
        }
        init();
    });

    return {
        render: function () {
            return '<div ng-controller="gamedateController"><div ng-include="htmlUrl"></div></div>';
        }
    }
});
