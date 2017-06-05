/**
 * Created by wuxiangan on 2016/12/13.
 */
app.controller('personalSiteCtrl', function ($scope, $state, Account, SelfData) {
    $scope.user = Account.getUser();
    $scope.isAuth = Account.isAuthenticated();

    var sitename = SelfData.sitename;
    $scope.renewalParams = {pageSize:3,websiteId: $scope.siteinfo._id};
    $scope.favoriteParams = {pageSize:3,userId:$scope.userinfo._id};
    $scope.allSiteParams = {pageSize:3,userId:$scope.userinfo._id};


    // 显示全部作品
    $scope.showWorksList = function() {
        $('#worksListNavId').toggle();
    }
    // 去网站管理页
    $scope.goWebsiteMangerPage = function() {
        window.location.href='/#/website';
    }
    // 页面编辑页面
    $scope.goWebsitePageManagerPage = function() {
        window.location.href = "/wiki/editor";
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
    $scope.goAllFavoriteList = function () {
        SelfData.requestUrl = config.apiUrlPrefix + "user_favorite/getFavoriteWebsiteListByUserId";
        SelfData.requestParams = $scope.favoriteParams;
        $state.go("siteshow");
    }

    // 更多全部作品
    $scope.goAllAllSiteList = function () {
        SelfData.requestUrl = config.apiUrlPrefix + "website/getByUserId";
        SelfData.requestParams = $scope.allSiteParams;
        $state.go("siteshow");
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
        if (!util.pagination(page, $scope.favoriteParams, $scope.favoriteObj && $scope.favoriteObj.pageCount)) {
            return; // 未翻页直接返回
        }

        // 获取我的收藏
        util.http("POST", config.apiUrlPrefix + "user_favorite/getFavoriteWebsiteListByUserId", $scope.favoriteParams, function (data) {
            $scope.favoriteObj = data;
        });
    }

    // 获得全部作品
    $scope.getAllSiteList = function (page) {
        if (!util.pagination(page, $scope.allSiteParams, $scope.allSiteObj && $scope.allSiteObj.pageCount)) {
            return; // 未翻页直接返回
        }
        // 获取全部作品列表
        util.http("POST", config.apiUrlPrefix + "website/getByUserId", $scope.allSiteParams, function (data) {
            $scope.allSiteObj = data;
        });
    }

    $scope.attention = function () {
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
            console.log(data);  // 申请成功
        });
    }


    function init() {
        util.http("POST", config.apiUrlPrefix + "website",{userId:$scope.userinfo._id}, function (data) {
            $scope.websiteList = data || [];
        });

        util.http("POST", config.apiUrlPrefix + "user/getStatics",{userId:$scope.userinfo._id}, function (data) {
            $scope.statics = data || [];
        });
        $scope.getRenewalList();
        $scope.getFavoriteList();
        $scope.getAllSiteList();
    }

    init();
});
