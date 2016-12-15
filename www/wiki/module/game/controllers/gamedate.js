
app.controller("gamedateCtrl", function ($scope) {
    function init() {
        var moduleParams = window.moduleObj.moduleParams;
        $scope.contributeDate = moduleParams.contributeDate || "待定";
        $scope.voteDate = moduleParams.voteDate || "待定";
        $scope.resultDate = moduleParams.resultDate || "待定";
    }
    init();
});