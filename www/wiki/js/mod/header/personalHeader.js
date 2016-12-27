
define(['app', 'util', 'storage'], function (app, util, storage) {
    app.registerController("personalHeaderController", function ($scope, $auth, Account, Message) {
        $scope.htmlUrl = config.wikiModPath + 'header/pages/personalHeader.page';
        // 显示全部作品
        $scope.showWorksList = function() {
            $('#worksListNavId').toggle();
        }
        // 去网站管理页
        $scope.goWebsiteMangerPage = function() {
            window.parent.location.href='/#/website';
        }
        // 页面编辑页面
        $scope.goWebsitePageManagerPage = function() {
            window.parent.location.href = "/wiki/editor";
        }
        // 去站点
        $scope.goWebsitePage = function (websiteName) {
            window.parent.location.href = '/' + websiteName;
        }

        $scope.attention = function () {
            if (!Account.isAuthenticated()) {
                // todo tipinfo
                Message.info("请登录");
                return;
            }
            // 自己不能关注自己
            if ($scope.user._id == $scope.userinfo._id) {
                return ;
            }

            // 发送关注请求
            var params = {
                favoriteUserId:$scope.userinfo._id,
                favoriteWebsiteId: $scope.siteinfo._id,
                userId:$scope.user._id,
            };
            util.http("POST", config.apiUrlPrefix + "user_favorite/favoriteUser", params, function (data) {
                Message.info("关注成功");
                console.log(data);  // 申请成功
            });
        }

        function init() {
            // 获得站点列表
            util.http("POST", config.apiUrlPrefix + "website",{userId:$scope.userinfo._id}, function (data) {
                $scope.websiteList = data || [];
            });
        }

        init();
    });


    return {
        render: function () {
            return '<div ng-controller="personalHeaderController"><div ng-include="htmlUrl"></div></div>';
        }
    }
});
