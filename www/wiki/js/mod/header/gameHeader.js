
define(['app', 'util', 'config', 'storage'], function (app, util, config, storage) {
    app.registerController("gameHeaderController", function ($scope, $auth, Account, Message) {
        $scope.htmlUrl = config.wikiModPath + 'header/pages/gameHeader.page';
        // worksApply
        $scope.goWorksApplyPage = function () {
            if (!Account.isAuthenticated()) {
                Message.info("登录后才能投稿!!!");
                return;
            }
            window.parent.sessionStorage.setItem("workApplyWebsiteId", $scope.siteinfo._id);
            window.parent.location.href = "/#/worksApply";
        }
    });
    
    return {
        render: function () {
            return '<div ng-controller="gameHeaderController"><div ng-include="htmlUrl"></div></div>';
        }
    }
});