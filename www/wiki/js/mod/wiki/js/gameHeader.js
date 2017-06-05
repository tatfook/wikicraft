
define([
    'app',
    'helper/storage',
    'text!wikimod/wiki/html/gameHeader.html',
], function (app, storage, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("gameHeaderController", ['$scope', '$auth', 'Account', 'Message', function ($scope, $auth, Account, Message) {
            // worksApply
            $scope.goWorksApplyPage = function () {
                if (!Account.isAuthenticated()) {
                    Message.info("登录后才能投稿!!!");
                    return;
                }
                storage.sessionStorageSetItem("workApplyWebsiteId", $scope.siteinfo._id);
                window.location.href = config.frontEndRouteUrl + "#/worksApply";
            }
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        }
    }
});