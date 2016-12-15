
app.controller("organizationHeaderCtrl", function ($scope, $auth, Account, Message) {
    $scope.memberApply = function () {
        // 自己不能关注自己
        if ($scope.user._id == $scope.userinfo._id) {
            return ;
        }

        // 发送关注请求
        var params = {
            applyId:$scope.userinfo._id,
            websiteId: $scope.siteinfo._id,
        };
        util.http("POST", config.apiUrlPrefix + "website_apply/memberApply", params, function (data) {
            console.log(data);  // 申请成功
        });
    }
});