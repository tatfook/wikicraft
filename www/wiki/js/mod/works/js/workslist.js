
define(['app', 'helper/util', 'helper/storage'], function (app, util, storage) {
    function registerController(wikiBlock) {
        app.registerController("workslistController", function ($scope, $auth, Account, Message) {
            $scope.htmlUrl = config.wikiModPath + 'works/pages/workslist.page';

            $scope.requestUrl = config.apiUrlPrefix + "website_works/getByWebsiteId";
            $scope.requestParams = {pageSize: 3, page: 0, websiteId: $scope.siteinfo._id};

            $scope.getAllSiteList = function () {
                var siteshowObj = {};
                siteshowObj.requestUrl = $scope.requestUrl;
                siteshowObj.requestParams = $scope.requestParams;
                siteshowObj.title = $scope.title;
                storage.sessionStorageSetItem("siteshow", siteshowObj)
                window.location.href = config.frontEndRouteUrl + "#/siteshow";
            }

            // 随机颜色
            $scope.getRandomColor = function (index) {
                return util.getRandomColor(index);
            }

            $scope.getSiteList = function (page) {
                if (!util.pagination(page, $scope.requestParams, $scope.siteObj && $scope.siteObj.pageCount)) {
                    return;
                }

                util.http("POST", $scope.requestUrl, $scope.requestParams, function (data) {
                    $scope.siteObj = data;
                });
            }

            function init() {
                var moduleParams = wikiBlock.modParams;
                var pageSize = parseInt(moduleParams.pageSize) || 3;
                pageSize = pageSize < 1 ? 1 : pageSize;
                $scope.workslistNavHeight = (200 + Math.floor((pageSize - 1) / 3) * 280) + "px";
                $scope.workslistHeight = Math.ceil(pageSize / 3) * 280 + "px";

                $scope.requestParams.pageSize = pageSize;

                //console.log(moduleParams);
                $scope.title = moduleParams.title || "全部作品";
                if (moduleParams.type == "all") {   // 全部
                    $scope.requestUrl = config.apiUrlPrefix + "website_works/getByWebsiteId";
                    $scope.requestParams.websiteId = $scope.siteinfo._id;
                } else if (moduleParams.type == "latestUpdate") { // 最近更新
                    $scope.requestUrl = config.apiUrlPrefix + "website_renewal";
                    $scope.requestParams.websiteId = $scope.siteinfo._id;
                } else if (moduleParams.type == "latestNew") {  // 最近加入
                    $scope.requestUrl = config.apiUrlPrefix + "website_works/getLatestByWebsiteId";
                    $scope.requestParams.websiteId = $scope.siteinfo._id;
                } else if (moduleParams.type == "favorite") {   // 我的收藏
                    $scope.requestUrl = config.apiUrlPrefix + "user_favorite/getFavoriteWebsiteListByUserId";
                    $scope.requestParams.userId = $scope.userinfo._id;
                } else if (moduleParams.type == "hot") { // 热门精选
                    $scope.requestUrl = config.apiUrlPrefix + "website_works/getHotByWebsiteId";
                    $scope.requestParams.websiteId = $scope.siteinfo._id;
                } else if (moduleParams.type == "upgrade") {  // 入围作品
                    $scope.requestUrl = config.apiUrlPrefix + "website_works/getUpgradeByWebsiteId";
                    $scope.requestParams.websiteId = $scope.siteinfo._id;
                }
                $scope.getSiteList();
            }

            init();
        });
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return '<div ng-controller="workslistController"><div ng-include="htmlUrl"></div></div>';
        }
    };
});