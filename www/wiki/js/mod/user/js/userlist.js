
define(['app', 'helper/util'], function (app, util) {
    function registerController(wikiBlock) {
        app.registerController("userlistController", function ($scope, $auth, Account, Message) {
            $scope.htmlUrl = config.wikiModPath + 'user/pages/userlist.page';

            $scope.requestUrl = config.apiUrlPrefix + "website_member/getByWebsiteId";
            $scope.requestParams = {pageSize: 6, page: 0, websiteId: $scope.siteinfo._id};

            $scope.getAllUserList = function () {
                var usershowObj = {};
                usershowObj.requestUrl = $scope.requestUrl;
                usershowObj.requestParams = $scope.requestParams;
                usershowObj.title = $scope.title;
                window.sessionStorage.setItem("usershow", util.objectToJsonString(usershowObj));
                window.location.href = "/#/usershow";
            }

            // 获得网站成员列表
            $scope.getUserList = function (page) {
                if (!util.pagination(page, $scope.requestParams, $scope.userObj && $scope.userObj.pageCount)) {
                    return; // 未翻页直接返回
                }
                // 获取全部作品列表
                util.http("POST", config.apiUrlPrefix + "website_member/getByWebsiteId", $scope.requestParams, function (data) {
                    $scope.userObj = data;
                });
            }

            function init() {
                var moduleParams = wikiBlock.modParams;
                moduleParams.type = moduleParams.type || "all";

                $scope.title = moduleParams.title || "成员信息";

                $scope.requestParams.pageSize = moduleParams.pageSize || 6;
                $scope.requestParams.websiteId = $scope.siteinfo._id;
                if (moduleParams.type == "all") {
                    $scope.requestUrl = config.apiUrlPrefix + "website_member/getByWebsiteId";
                } else if (moduleParams.type == "judge") {
                    $scope.requestUrl = config.apiUrlPrefix + "website_member/getJudgeListByWebsiteId";
                }

                $scope.getUserList();
            }

            init();
        });
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return '<div ng-controller="userlistController"><div ng-include="htmlUrl"></div></div>';
        }
    }
});