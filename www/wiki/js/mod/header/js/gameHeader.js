
define(['app'], function (app) {
    function registerController(wikiBlock) {
        app.registerController("gameHeaderController", function ($scope, $auth, Account, Message) {
            $scope.htmlUrl = config.wikiModPath + 'header/pages/gameHeader.page';
            // worksApply
            $scope.goWorksApplyPage = function () {
                if (!Account.isAuthenticated()) {
                    Message.info("登录后才能投稿!!!");
                    return;
                }
                window.sessionStorage.setItem("workApplyWebsiteId", $scope.siteinfo._id);
                window.location.href = "/#/worksApply";
            }
        });
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return '<div ng-controller="gameHeaderController"><div ng-include="htmlUrl"></div></div>';
        }
    }
});