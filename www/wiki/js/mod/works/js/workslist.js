
define([
    'app',
    'helper/util',
    'helper/storage',
    'text!wikimod/works/html/workslist.html',
], function (app, util, storage, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("workslistController", ['$scope','Account','Message',function ($scope, Account, Message) {
            $scope.imgsPath = config.wikiModPath + 'works/assets/imgs/';
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

            $scope.getSiteList = function (page) {
                var pageCount = 1;
                if ($scope.siteTotal) {
                    pageCount = $scope.siteTotal / requestParams.pageSize + ($scope.siteTotal % requestParams.pageSize && 1);
                }
                if (!util.pagination(page, $scope.requestParams, pageCount)) {
                    return;
                }

                util.http("POST", $scope.requestUrl, $scope.requestParams, function (data) {
                    data = data || {};
                    $scope.siteList = data.siteList;
                    $scope.siteTotal = data.total;
                });
            }

            function init() {
                var moduleParams = wikiBlock.modParams || {};
                var pageSize = parseInt(moduleParams.pageSize || "3");
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
                } else {
                    $scope.requestUrl = config.apiUrlPrefix + "website_works/getByWebsiteId";
                    $scope.requestParams.websiteId = $scope.siteinfo._id;
                }
                $scope.getSiteList();
            }
            $scope.$watch("$viewContentLoaded", init);
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        }
    };
});