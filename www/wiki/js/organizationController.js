/**
 * Created by wuxiangan on 2016/9/26.
 */

app.controller("organizationSiteCtrl", function ($scope, $state, SelfData) {
    $scope.renewalParams = {pageSize:3,websiteId:$scope.siteinfo._id};
    $scope.hotWorksParams = {pageSize:3,websiteId:$scope.siteinfo._id, worksFlag:2};
    $scope.allSiteParams = {pageSize:3,websiteId:$scope.siteinfo._id};
    $scope.userParams = {pageSize:6,websiteId:$scope.siteinfo._id};

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

    // 随机颜色
    $scope.getRandomColor = function (index) {
        return util.getRandomColor(index);
    }

    // 更多最近更新
    $scope.goAllRenewalList = function () {
        SelfData.requestUrl = config.apiUrlPrefix + "website_renewal";
        SelfData.requestParams = $scope.renewalParams;
        $state.go("siteshow");
    }

    // 更多我的收藏
    $scope.goAllHotWorksList = function () {
        SelfData.requestUrl = config.apiUrlPrefix + "user_favorite/getFavoriteWebsiteListByUserId";
        SelfData.requestParams = $scope.hotWorksParams;
        $state.go("siteshow");
    }

    // 更多全部作品
    $scope.goAllAllSiteList = function () {
        SelfData.requestUrl = config.apiUrlPrefix + "website/getByUserId";
        SelfData.requestParams = $scope.allSiteParams;
        $state.go("siteshow");
    }

    // 获得等多用户列表
    $scope.getAllUserList = function () {
        // TODO
    }
    // 获得最近更新
    $scope.getRenewalList = function (page) {
        if (!util.pagination(page, $scope.renewalParams, $scope.renewalObj && $scope.renewalObj.pageCount)) {
            return; // 未翻页直接返回
        }
        util.http("POST", config.apiUrlPrefix + "website_renewal", $scope.renewalParams, function (data) {
            $scope.renewalObj = data;
        });
    }

    // 获得我的收藏
    $scope.getFavoriteList = function (page) {
        if (!util.pagination(page, $scope.hotWorksParams, $scope.hotWorksObj && $scope.hotWorksObj.pageCount)) {
            return; // 未翻页直接返回
        }

        // 获取热门作品
        util.http("POST", config.apiUrlPrefix + "website_works/getByWebsiteId", $scope.hotWorksParams, function (data) {
            $scope.hotWorksObj = data;
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
    $scope.getUserList = function (page) {
        if (!util.pagination(page, $scope.userParams, $scope.userObj && $scope.userObj.pageCount)) {
            return; // 未翻页直接返回
        }
        // 获取全部作品列表
        util.http("POST", config.apiUrlPrefix + "website_member/getByWebsiteId", $scope.userParams, function (data) {
            $scope.userObj = data;
        });
    }
    function init() {
        // 获取想管统计信息
        util.http("POST", config.apiUrlPrefix + 'website/getStatics', {websiteId:$scope.siteinfo._id}, function (data) {
           $scope.statics = data || {};
        });

        $scope.getRenewalList();
		$scope.getFavoriteList();
		$scope.getAllSiteList();
		$scope.getUserList();
    }
    
    init();
});
