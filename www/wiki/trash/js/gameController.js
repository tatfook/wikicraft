/**
 * Created by wuxiangan on 2016/12/15.
 */
app.controller("gameSiteCtrl", function ($scope, $state, SelfData) {
    $scope.upgradeParams = {pageSize:3,websiteId:$scope.siteinfo._id};
    $scope.latestParams = {pageSize:3,websiteId:$scope.siteinfo._id};
    $scope.allSiteParams = {pageSize:3,websiteId:$scope.siteinfo._id};
    $scope.judgeParams = {pageSize:6,websiteId:$scope.siteinfo._id};

    // worksApply
    $scope.goWorksApplyPage = function () {
        $state.go('worksApply');
    }

    // 随机颜色
    $scope.getRandomColor = function (index) {
        return util.getRandomColor(index);
    }

    // 更多入围作品
    $scope.goAllUpgradeList = function () {
        SelfData.requestUrl = config.apiUrlPrefix + "website_works/getUpgradeByWebsiteId";
        SelfData.requestParams = $scope.upgradeParams;
        $state.go("siteshow");
    }

    // 更多我的收藏
    $scope.goAllLatestList = function () {
        SelfData.requestUrl = config.apiUrlPrefix + "website_works/getLatestByWebsiteId";
        SelfData.requestParams = $scope.latestParams;
        $state.go("siteshow");
    }

    // 更多全部作品
    $scope.goAllAllSiteList = function () {
        SelfData.requestUrl = config.apiUrlPrefix + "website_works/getByWebsiteId";
        SelfData.requestParams = $scope.allSiteParams;
        $state.go("siteshow");
    }

    // 获得等多用户列表
    $scope.getAllUserList = function () {
        // TODO
    }
    // 获得入围作品
    $scope.getUpgradelList = function (page) {
        if (!util.pagination(page, $scope.upgradeParams, $scope.upgradeObj && $scope.upgradeObj.pageCount)) {
            return; // 未翻页直接返回
        }
        util.http("POST", config.apiUrlPrefix + "website_works/getUpgradeByWebsiteId", $scope.upgradeParams, function (data) {
            $scope.upgradeObj = data;
        });
    }

    // 获得最新上传
    $scope.getLatestList = function (page) {
        if (!util.pagination(page, $scope.latestParams, $scope.latestObj && $scope.latestObj.pageCount)) {
            return; // 未翻页直接返回
        }

        // 获取热门作品
        util.http("POST", config.apiUrlPrefix + "website_works/getLatestByWebsiteId", $scope.latestParams, function (data) {
            $scope.latestObj = data;
        });
    }

    // 获得全部作品
    $scope.getAllSiteList = function (page) {
        if (!util.pagination(page, $scope.allSiteParams, $scope.allSiteObj && $scope.allSiteObj.pageCount)) {
            return; // 未翻页直接返回
        }
        // 获取全部作品列表
        util.http("POST", config.apiUrlPrefix + "website_works/getByWebsiteId", $scope.allSiteParams, function (data) {
            $scope.allSiteObj = data;
        });
    }

    // 获得网站成员列表
    $scope.getJudgeList = function (page) {
        if (!util.pagination(page, $scope.judgeParams, $scope.judgeObj && $scope.judgeObj.pageCount)) {
            return; // 未翻页直接返回
        }
        // 获取全部作品列表
        util.http("POST", config.apiUrlPrefix + "website_member/getJudgeListByWebsiteId", $scope.judgeParams, function (data) {
            $scope.judgeObj = data;
        });
    }

    function init() {
        // 获取想管统计信息
        util.http("POST", config.apiUrlPrefix + 'website/getStatics', {websiteId:$scope.siteinfo._id}, function (data) {
            $scope.statics = data || {};
        });

        $scope.getUpgradelList();
        $scope.getLatestList();
        $scope.getAllSiteList();
    }

    init();
});

