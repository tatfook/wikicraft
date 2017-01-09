
define(['app', 'helper/util'], function (app, util) {
    function registerController(wikiBlock) {
        app.registerController("organizationHeaderController", function ($scope, $auth, Account, Message) {
            $scope.htmlUrl = config.wikiModPath + 'header/pages/organizationHeader.page';
            $scope.memberApply = function () {
                if (!Account.isLoaded()) {
                    Message.info("请重新登录!!!");
                    return;
                }
                // 自己不能关注自己
                if ($scope.user._id == $scope.userinfo._id) {
                    return;
                }

                // 发送关注请求
                var params = {
                    applyId: $scope.user._id,
                    websiteId: $scope.siteinfo._id,
                };

                util.http("POST", config.apiUrlPrefix + "website_apply/memberApply", params, function (data) {
                    console.log(data);  // 申请成功
                    Message.info("成员申请成功");
                });
            }
        });
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return '<div ng-controller="organizationHeaderController"><div ng-include="htmlUrl"></div></div>';
        }
    }
});