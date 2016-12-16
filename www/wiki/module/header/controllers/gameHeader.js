
app.controller("gameHeaderCtrl", function ($scope, $auth, Account, Message) {
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