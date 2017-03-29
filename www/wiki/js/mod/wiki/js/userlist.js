
define([
    'app',
    'helper/util',
    'helper/storage',
    'text!wikimod/wiki/html/userlist.html',
], function (app, util, storage, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("userlistController", ['$scope',function ($scope) {
            $scope.requestUrl = config.apiUrlPrefix + "website_member/getByWebsiteId";
            $scope.requestParams = {pageSize: 6, page: 0, websiteId: $scope.siteinfo._id};

            $scope.getAllUserList = function () {
                var usershowObj = {};
                usershowObj.requestUrl = $scope.requestUrl;
                usershowObj.requestParams = $scope.requestParams;
                usershowObj.title = $scope.title;
                storage.sessionStorageSetItem("usershow",usershowObj);
                window.location.href = config.apiUrlPrefix + "#/usershow";
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
                moduleParams.title = moduleParams.title || "成员信息";
                $scope.moduleParams = moduleParams;
                //console.log(moduleParams);

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
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        }
    }
});